import { Client as NotionClient } from '@notionhq/client';
import { QueryDatabaseParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

/**
 * From @notionhq/client
 */
type WithAuth<P> = P & {
  auth?: string;
};

export class NotionDatabaseBaseClient {
  constructor(
    /**
     * The Notion Client
     */
    protected readonly notion: NotionClient,
    /**
     * The database id
     */
    protected readonly databaseId: string
  ) {}

  query(args: WithAuth<Omit<QueryDatabaseParameters, 'database_id'>>): Promise<QueryDatabaseResponse> {
    return this.notion.databases.query({
      database_id: this.databaseId,
      ...args,
    });
  }
}

export class NotionDatabaseClient extends NotionDatabaseBaseClient {
  updateTitle() {}
}

const notion = new NotionClient({ auth: process.env.NOTION_KEY });
const client = new NotionDatabaseClient(notion, 'databaseId')
  .query({
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            is_not_empty: true,
          },
        },
      ],
    },
  })
