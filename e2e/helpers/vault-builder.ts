// eslint-disable-next-line import/no-nodejs-modules
import * as fs from 'node:fs/promises'
// eslint-disable-next-line import/no-nodejs-modules
import * as path from 'node:path'

export type FrontmatterValue = string | number | boolean | readonly string[]

export type NoteDefinition = Readonly<{
  relativePath: string
  frontmatter: Readonly<Record<string, FrontmatterValue>>
  body?: string
}>

export const serializeFrontmatter = (fm: Readonly<Record<string, FrontmatterValue>>): string => {
  const entries = Object.entries(fm)
  if (entries.length === 0) {
    return '---\n---\n'
  }

  const lines = ['---']
  for (const [key, value] of entries) {
    if (typeof value === 'string') {
      // Escape quotes in string if necessary, but typically standard quotes are fine or just quote everything.
      // Requirements say: string: key: "value" (quoted)
      const escapedValue = value.replace(/"/g, '\\"')
      // eslint-disable-next-line functional/immutable-data
      lines.push(`${key}: "${escapedValue}"`)
    }
    else if (typeof value === 'number' || typeof value === 'boolean') {
      // Requirements say: number: key: 42 (unquoted), boolean: key: true (unquoted)
      // eslint-disable-next-line functional/immutable-data
      lines.push(`${key}: ${value}`)
    }
    else if (Array.isArray(value)) {
      // Requirements say: readonly string[]: key:\n  - item1\n  - item2 (YAML list format)
      // eslint-disable-next-line functional/immutable-data
      lines.push(`${key}:`)
      for (const item of value) {
        // eslint-disable-next-line functional/immutable-data
        lines.push(`  - ${item}`)
      }
    }
  }
  // eslint-disable-next-line functional/immutable-data
  lines.push('---')
  return lines.join('\n') + '\n'
}

export class NoteBuilder {
  private constructor(
    private readonly relativePath: string,
    private readonly frontmatter: Readonly<Record<string, FrontmatterValue>>,
    private readonly body?: string,
  ) {}

  static create(relativePath: string): NoteBuilder {
    return new NoteBuilder(relativePath, {})
  }

  withProperty(key: string, value: FrontmatterValue): NoteBuilder {
    return new NoteBuilder(
      this.relativePath,
      { ...this.frontmatter, [key]: value },
      this.body,
    )
  }

  withBody(content: string): NoteBuilder {
    return new NoteBuilder(this.relativePath, this.frontmatter, content)
  }

  build(): NoteDefinition {
    return {
      relativePath: this.relativePath,
      frontmatter: this.frontmatter,
      body: this.body,
    }
  }
}

export class VaultBuilder {
  private constructor(private readonly notes: readonly NoteDefinition[]) {}

  static create(): VaultBuilder {
    return new VaultBuilder([])
  }

  withNote(note: NoteDefinition): VaultBuilder {
    return new VaultBuilder([...this.notes, note])
  }

  withNotes(notes: readonly NoteDefinition[]): VaultBuilder {
    return new VaultBuilder([...this.notes, ...notes])
  }

  async build(outputDir: string): Promise<void> {
    for (const note of this.notes) {
      const fullPath = path.join(outputDir, note.relativePath)
      const parentDir = path.dirname(fullPath)

      await fs.mkdir(parentDir, { recursive: true })

      const frontmatterStr = serializeFrontmatter(note.frontmatter)
      const content = note.body !== undefined ? `${frontmatterStr}\n${note.body}` : frontmatterStr

      await fs.writeFile(fullPath, content, 'utf-8')
    }
  }
}
