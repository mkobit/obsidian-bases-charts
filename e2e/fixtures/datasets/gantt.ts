import { z } from 'zod'
import { NoteBuilder } from '../../helpers/vault-builder'
import type { NoteDefinition } from '../../helpers/vault-builder'

export const GanttRecordSchema = z.object({
  Task: z.string(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  Start: z.string().datetime({ offset: true }).or(z.string()), // Accept ISO dates or simple strings
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  End: z.string().datetime({ offset: true }).or(z.string()),
  Category: z.enum(['Planning', 'Development', 'Testing', 'Deployment']),
  Status: z.enum(['To Do', 'In Progress', 'Done']),
}).readonly()

export type GanttRecord = z.infer<typeof GanttRecordSchema>

const rawGantt: readonly GanttRecord[] = [
  { Task: 'Project Kickoff', Start: '2024-01-01', End: '2024-01-05', Category: 'Planning', Status: 'Done' },
  { Task: 'Requirements Gathering', Start: '2024-01-06', End: '2024-01-15', Category: 'Planning', Status: 'Done' },
  { Task: 'System Design', Start: '2024-01-16', End: '2024-01-30', Category: 'Planning', Status: 'In Progress' },
  { Task: 'Frontend Development', Start: '2024-02-01', End: '2024-02-28', Category: 'Development', Status: 'To Do' },
  { Task: 'Backend API', Start: '2024-02-01', End: '2024-03-15', Category: 'Development', Status: 'To Do' },
  { Task: 'Integration Testing', Start: '2024-03-16', End: '2024-03-31', Category: 'Testing', Status: 'To Do' },
  { Task: 'User Acceptance Testing', Start: '2024-04-01', End: '2024-04-15', Category: 'Testing', Status: 'To Do' },
  { Task: 'Production Deployment', Start: '2024-04-16', End: '2024-04-20', Category: 'Deployment', Status: 'To Do' },
]

export const ganttDataset: readonly NoteDefinition[] = rawGantt.map((record, index) =>
  NoteBuilder.create(`Task-${index + 1}.md`)
    .withFrontmatter(GanttRecordSchema.parse(record))
    .build(),
)
