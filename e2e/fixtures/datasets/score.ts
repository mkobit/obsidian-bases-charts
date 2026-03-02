import { z } from 'zod'
import { createNote } from '../../helpers/vault-builder'
import type { NoteDefinition } from '../../helpers/vault-builder'

export const ScoreRecordSchema = z.object({
  Subject: z.enum(['Math', 'Science', 'History']),
  Score: z.number().int().min(0).max(100),
  Grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  Student: z.string(),
}).readonly()

export type ScoreRecord = z.infer<typeof ScoreRecordSchema>

const rawScores: readonly ScoreRecord[] = [
  { Subject: 'Math', Score: 95, Grade: 'A', Student: 'Alice' },
  { Subject: 'Science', Score: 88, Grade: 'B', Student: 'Alice' },
  { Subject: 'History', Score: 92, Grade: 'A', Student: 'Alice' },
  { Subject: 'Math', Score: 78, Grade: 'C', Student: 'Bob' },
  { Subject: 'Science', Score: 85, Grade: 'B', Student: 'Bob' },
  { Subject: 'History', Score: 80, Grade: 'B', Student: 'Bob' },
  { Subject: 'Math', Score: 100, Grade: 'A', Student: 'Charlie' },
  { Subject: 'Science', Score: 96, Grade: 'A', Student: 'Charlie' },
  { Subject: 'History', Score: 94, Grade: 'A', Student: 'Charlie' },
  { Subject: 'Math', Score: 82, Grade: 'B', Student: 'Diana' },
  { Subject: 'Science', Score: 89, Grade: 'B', Student: 'Diana' },
  { Subject: 'History', Score: 85, Grade: 'B', Student: 'Diana' },
  { Subject: 'Math', Score: 91, Grade: 'A', Student: 'Eve' },
  { Subject: 'Science', Score: 93, Grade: 'A', Student: 'Eve' },
  { Subject: 'History', Score: 88, Grade: 'B', Student: 'Eve' },
]

export const scoreDataset: readonly NoteDefinition[] = rawScores.map(record =>
  createNote(`Score-${record.Student}-${record.Subject}.md`, ScoreRecordSchema.parse(record)),
)
