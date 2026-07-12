import { build } from 'tsup'
import pkg from './package.json' with { type: 'json' }

const watch = process.argv.slice(2)[0] === '--watch'

await build({
  entry: ['src/index.ts', 'src/cli.ts'],
  dts: true,
  minify: true,
  format: ['esm'],
  target: 'es2022',
  clean: true,
  noExternal: ['@cryptgeon/shared'],
  define: { VERSION: `"${pkg.version}"` },
  watch,
})