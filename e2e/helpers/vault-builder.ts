// eslint-disable-next-line import/no-nodejs-modules
import * as fs from 'node:fs/promises'
// eslint-disable-next-line import/no-nodejs-modules
import * as path from 'node:path'
import { z } from 'zod'
import { Temporal } from 'temporal-polyfill'

export const FrontmatterValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()).readonly(),
  z.instanceof(Temporal.PlainDate),
  z.instanceof(Temporal.Instant),
  z.instanceof(Temporal.PlainDateTime),
  z.instanceof(Temporal.ZonedDateTime),
])

export type FrontmatterValue = z.infer<typeof FrontmatterValueSchema>

export const PathSchema = z.object({
  dir: z.string(),
  name: z.string(),
  ext: z.string(),
  base: z.string(),
}).readonly()

export type Path = z.infer<typeof PathSchema>

export const NoteDefinitionSchema = z.object({
  relativePath: PathSchema,
  frontmatter: z.record(z.string(), FrontmatterValueSchema).readonly(),
  body: z.string().optional(),
}).readonly()

export type NoteDefinition = z.infer<typeof NoteDefinitionSchema>

export const serializeFrontmatter = (fm: Readonly<Record<string, FrontmatterValue>>): string => {
  const entries = Object.entries(fm)
  if (entries.length === 0) {
    return '---\n---\n'
  }

  const lines = entries.flatMap(([key, value]) => {
    if (typeof value === 'string') {
      const escapedValue = value.replace(/"/g, '\\"')
      return [`${key}: "${escapedValue}"`]
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return [`${key}: ${value}`]
    }
    if (Array.isArray(value)) {
      return [`${key}:`, ...value.map(item => `  - ${item}`)]
    }
    // Handle Temporal objects by checking for toString
    if (value && typeof (value as { toString?: () => string }).toString === 'function') {
      return [`${key}: ${(value as { toString: () => string }).toString()}`]
    }
    return []
  })

  return ['---', ...lines, '---'].join('\n') + '\n'
}

export class NoteBuilder {
  private constructor(
    private readonly relativePath: Path,
    private readonly frontmatter: Readonly<Record<string, FrontmatterValue>>,
    private readonly body?: string,
  ) {}

  static create(relativePath: string): NoteBuilder {
    const parsed = path.parse(relativePath)
    return new NoteBuilder({
      dir: parsed.dir,
      name: parsed.name,
      ext: parsed.ext,
      base: parsed.base,
    }, {})
  }

  withProperty(key: string, value: FrontmatterValue): NoteBuilder {
    return new NoteBuilder(
      this.relativePath,
      { ...this.frontmatter, [key]: value },
      this.body,
    )
  }

  withFrontmatter(frontmatter: Readonly<Record<string, FrontmatterValue>>): NoteBuilder {
    return new NoteBuilder(
      this.relativePath,
      { ...this.frontmatter, ...frontmatter },
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

  getNotes(): readonly NoteDefinition[] {
    return this.notes
  }

  withNote(note: NoteDefinition): VaultBuilder {
    return new VaultBuilder([...this.notes, note])
  }

  withNotes(notes: readonly NoteDefinition[]): VaultBuilder {
    return new VaultBuilder([...this.notes, ...notes])
  }
}

export async function writeNoteToVault(baseDir: string, note: NoteDefinition): Promise<void | Error> {
  try {
    const fullPath = path.join(baseDir, note.relativePath.dir, note.relativePath.base)
    const parentDir = path.dirname(fullPath)

    await fs.mkdir(parentDir, { recursive: true })

    const frontmatterStr = serializeFrontmatter(note.frontmatter)
    const content = note.body !== undefined ? `${frontmatterStr}\n${note.body}` : frontmatterStr

    await fs.writeFile(fullPath, content, 'utf-8')
  }
  catch (error) {
    if (error instanceof Error) {
      return error
    }
    return new Error(String(error))
  }
}
