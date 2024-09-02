import { build } from 'tsup'
import pkg from './package.json' with { type: 'json' }

const watch = process.argv.slice(2)[0] === '--watch'

await build({
  entry: ['src/index.ts', 'src/cli.ts', 'src/shared/shared.ts'],
  dts: true,
  minify: true,
  format: ['esm', 'cjs'],
  target: 'es2020',
  clean: true,
  define: { VERSION: `"${pkg.version}"` },
  watch,
})
