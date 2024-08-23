import pkg from './package.json' with { type: 'json' }
import { build } from 'tsup'

const watch = process.argv.slice(2)[0] === '--watch'

await build({
  entry: ['src/index.ts', 'src/cli.ts'],
  dts: true,
  minify: true,
  format: ['esm', 'cjs'],
  clean: true,
  define: { VERSION: `"${pkg.version}"` },
  watch,
})
