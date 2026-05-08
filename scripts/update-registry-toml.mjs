#!/usr/bin/env node
/**
 * Idempotently add or bump a `[<id>]` block in extensions.toml.
 * Usage: node update-registry-toml.mjs <id> <version> <submodule-path>
 */
import { readFileSync, writeFileSync } from 'node:fs'

const [, , id, version, submodule] = process.argv
if (!id || !version || !submodule) {
  console.error('usage: update-registry-toml.mjs <id> <version> <submodule-path>')
  process.exit(64)
}

const path = 'extensions.toml'
let toml = readFileSync(path, 'utf8')

const block = `[${id}]\nsubmodule = "${submodule}"\nversion = "${version}"\n`
const blockRegex = new RegExp(
  `\\[${id.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\][^[]*`,
  'm',
)

if (blockRegex.test(toml)) {
  toml = toml.replace(blockRegex, `${block}\n`)
  console.log(`Updated existing entry for ${id}`)
} else {
  toml = toml.endsWith('\n') ? toml : toml + '\n'
  toml += `\n${block}`
  console.log(`Appended new entry for ${id} (pnpm sort-extensions will alphabetize)`)
}

writeFileSync(path, toml)
