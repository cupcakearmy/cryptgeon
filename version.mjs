#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const VERSION = process.argv[2]
const semver =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm
if (!semver.test(VERSION)) {
  console.error('Invalid version number')
  process.exit(1)
}

function sed(file, pattern, replacement) {
  const content = readFileSync(file, 'utf-8')
  writeFileSync(file, content.replace(pattern, replacement))
}

sed('./packages/cli/package.json', /"version": ".*"/, `"version": "${VERSION}"`)
sed('./packages/backend/Cargo.toml', /^version = ".*"$/m, `version = "${VERSION}"`)

execSync('cargo check -p cryptgeon', { cwd: './packages/backend' })