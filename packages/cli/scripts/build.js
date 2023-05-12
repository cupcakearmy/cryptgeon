#!/usr/bin/env node

import { build, context } from 'esbuild'
import pkg from '../package.json' assert { type: 'json' }

const options = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  outfile: './dist/index.cjs',
  define: { VERSION: `"${pkg.version}"` },
}

const watch = process.argv.slice(2)[0] === '--watch'
if (watch) (await context(options)).watch()
else await build(options)
