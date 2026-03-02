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
    // Explicitly check for Temporal types using instanceof
    if (
      value instanceof Temporal.PlainDate
      || value instanceof Temporal.Instant
      || value instanceof Temporal.PlainDateTime
      || value instanceof Temporal.ZonedDateTime
    ) {
      return [`${key}: ${value.toString()}`]
    }
    return []
  })

  return ['---', ...lines, '---'].join('\n') + '\n'
}

export const createNote = (
  relativePath: string,
  frontmatter: Readonly<Record<string, FrontmatterValue>>,
  body?: string,
): NoteDefinition => {
  const parsed = path.parse(relativePath)
  return {
    relativePath: {
      dir: parsed.dir,
      name: parsed.name,
      ext: parsed.ext,
      base: parsed.base,
    },
    frontmatter,
    body,
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
