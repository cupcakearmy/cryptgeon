#!/usr/bin/env node

import { exec } from 'pkg'

const targets = [
  'node18-macos-arm64',
  'node18-macos-x64',
  'node18-linux-arm64',
  'node18-linux-x64',
  'node18-win-arm64',
  'node18-win-x64',
]

for (const target of targets) {
  console.log(`🚀 Building ${target}`)
  await exec(['./dist/index.cjs', '--target', target, '--output', `./bin/${target.replace('node18', 'cryptgeon')}`])
}
