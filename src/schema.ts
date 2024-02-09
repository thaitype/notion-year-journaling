
import { z } from 'zod'

export const schema = z.object({
  DAILY_JOURNAL_DATABASE_ID: z.string(),
  NOTION_KEY: z.string(),
});
