export type NoteMeta = {
  expiration?: number;
  views?: number;
  extra?: Uint8Array;
};

export type ServerNote = {
  meta: NoteMeta;
  data: Uint8Array;
};

export type NoteContent =
  | { type: "text"; data: string }
  | { type: "files"; data: FileDTO[] };

export type FileDTO = {
  name: string;
  mime: string;
  size: number;
  data: Uint8Array;
};