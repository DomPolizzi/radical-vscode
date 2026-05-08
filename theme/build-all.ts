/**
 * Build orchestrator — emits both VSCode and Zed targets from one source
 * of truth, then renders extension.toml from the template.
 *
 * Failure semantics: uses `Promise.allSettled` so partial failure is
 * surfaced explicitly. If either adapter fails, the orchestrator exits
 * non-zero and prints both errors. The successfully-built target is
 * still written (the failed one's output simply isn't refreshed).
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

import pkg from '../package.json' with { type: 'json' }

const root = process.cwd()

function runScript(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['tsx', script], { stdio: 'inherit', cwd: root })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${script} exited with code ${code}`))
    })
    child.on('error', reject)
  })
}

async function renderExtensionToml(): Promise<void> {
  const template = await fs.readFile(path.resolve(root, 'extension.toml.template'), 'utf8')
  const rendered = template.replace(/\{\{VERSION\}\}/g, pkg.version)
  await fs.writeFile(path.resolve(root, 'extension.toml'), rendered)
}

const results = await Promise.allSettled([
  runScript('theme/vscode/build.ts'),
  runScript('theme/zed/build.ts'),
])

const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[]

if (failed.length) {
  for (const r of failed) {
    console.error(`✗ ${r.reason}`)
  }
  process.exit(1)
}

await renderExtensionToml()
console.log(`extension.toml rendered with version ${pkg.version}`)
console.log('build-all finished')
