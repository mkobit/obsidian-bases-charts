import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const FILES = ['manifest.json', 'package.json']

function getGitSha() {
  const result = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf-8' })
  if (result.error) {
    throw result.error
  }
  return result.stdout.trim()
}

interface Manifest {
  version: string
  [key: string]: unknown
}

function updateVersion() {
  try {
    const sha = getGitSha()
    console.log(`Current SHA: ${sha}`)

    for (const filename of FILES) {
      const filePath = resolve(process.cwd(), filename)
      const content = readFileSync(filePath, 'utf-8')
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const json = JSON.parse(content) as Manifest
      const originalVersion = json.version

      // Strip existing pre-release/build metadata to get base version
      const baseVersion = originalVersion.split('-')[0]
      const newVersion = `${baseVersion}-beta-${sha}`

      console.log(`Updating ${filename}: ${originalVersion} -> ${newVersion}`)
      json.version = newVersion

      // Write with tab indentation and trailing newline to match existing style
      writeFileSync(filePath, JSON.stringify(json, null, '\t') + '\n')
    }
  }
  catch (error) {
    console.error('Error updating version:', error)
    process.exit(1)
  }
}

updateVersion()
