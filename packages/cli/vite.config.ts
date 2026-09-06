import { defineConfig } from "vite-plus";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/cli.ts"],
    dts: true,
    minify: true,
    format: ["esm"],
    target: "es2023",
    deps: { alwaysBundle: ["**"] },
    define: { VERSION: JSON.stringify(pkg.version) },
  },
});
