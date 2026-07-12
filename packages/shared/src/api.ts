import { encode, decode } from "@msgpack/msgpack";

import type { ServerNote } from "./types.js";

let server = "";

export function setServer(url: string) {
  server = url.replace(/\/+$/, "");
}

export function getServer() {
  return server;
}

function api(path: string) {
  return `${server}/api/v3/${path}`;
}

export async function create(note: ServerNote): Promise<{ id: string }> {
  const res = await fetch(api("notes"), {
    method: "POST",
    headers: { "content-type": "application/msgpack" },
    body: encode(note),
  });
  if (!res.ok) throw new Error("create failed");
  const buf = await res.arrayBuffer();
  const data = decode(new Uint8Array(buf)) as any;
  if (typeof data?.id !== "string") throw new Error("invalid response");
  return { id: data.id };
}

export async function info(id: string): Promise<ServerNote["meta"] | null> {
  const res = await fetch(api(`notes/${id}`));
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  const data = decode(new Uint8Array(buf)) as any;
  const meta = data?.meta as ServerNote["meta"] | undefined;
  if (!meta) return null;
  if (meta.extra && !(meta.extra instanceof Uint8Array)) meta.extra = new Uint8Array(meta.extra as any);
  return meta;
}

export async function get(id: string): Promise<ServerNote | null> {
  const res = await fetch(api(`notes/${id}`), { method: "DELETE" });
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  const data = decode(new Uint8Array(buf)) as any;
  const meta = data.meta as ServerNote["meta"];
  if (meta?.extra && !(meta.extra instanceof Uint8Array)) meta.extra = new Uint8Array(meta.extra as any);
  const d = data.data;
  return { meta, data: d instanceof Uint8Array ? d : new Uint8Array(d) } satisfies ServerNote;
}

export async function status(): Promise<Record<string, unknown>> {
  const res = await fetch(api("status"));
  if (!res.ok) throw new Error("status failed");
  return res.json();
}