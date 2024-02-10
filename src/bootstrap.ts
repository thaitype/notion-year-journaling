import { Client as NotionClient } from '@notionhq/client';
import { NotionDatabase } from './notion/notion-database-client';
import { schema } from './schema';

export const env = schema.parse(process.env);
const notion = new NotionClient({ auth: env.NOTION_KEY });
export const dailyJournalDb = new NotionDatabase(notion, env.DAILY_JOURNAL_DATABASE_ID).setPropTypes({
  Name: 'title',
  Date: 'date',
});
