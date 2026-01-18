import { z } from 'zod'

// eslint-disable-next-line functional/prefer-immutable-types
export const jsonParsed = <T extends z.ZodType>(schema: T) =>
  z.string().transform((str, ctx) => { // eslint-disable-line functional/prefer-immutable-types
    // eslint-disable-next-line functional/no-try-statements
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(str)
    }
    catch {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  }).pipe(schema)
