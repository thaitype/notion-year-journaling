import { Client as NotionClient } from '@notionhq/client';
import { QueryDatabaseParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

/**
 * From @notionhq/client
 */
type WithAuth<P> = P & {
  auth?: string;
};

export class NotionDatabase {
  constructor(
    /**
     * The Notion Client
     */
    public readonly notion: NotionClient,
    /**
     * The database id
     */
    public readonly databaseId: string
  ) {}

  query(args?: WithAuth<Omit<QueryDatabaseParameters, 'database_id'>>): Promise<QueryDatabaseResponse> {
    return this.notion.databases.query({
      database_id: this.databaseId,
      ...args,
    });
  }

  get page(){
    return new NotionPage(this.notion);
  }
}

export class NotionPage {
  constructor(
    /**
     * The Notion Client
     */
    public readonly notion: NotionClient,
  ) {}

  updateTitle(args: {
    pageId: string;
    title: string;
    propName?: string;
  }) {
    return this.notion.pages.update({
      page_id: args.pageId,
      properties: {
        [args.propName ?? 'Name']: {
          title: [
            {
              text: {
                content: args.title,
              },
            },
          ],
        },
      },
    });
  }
}
