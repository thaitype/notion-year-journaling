import { Client as NotionClient } from '@notionhq/client';
import {
  QueryDatabaseParameters,
  QueryDatabaseResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

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

  /**
   * TODO: Handle pagination with Async Iterators later
   */
  async query(args?: WithAuth<Omit<QueryDatabaseParameters, 'database_id'>>): Promise<PageObjectResponse[]> {
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      ...args,
    });
    const results = response.results.filter((page) => NotionPage.isPageObjectResponse(page)) as PageObjectResponse[];
    return results;
  }

  get page() {
    return new NotionPage(this.notion);
  }
}

export class NotionPage {
  constructor(
    /**
     * The Notion Client
     */
    public readonly notion: NotionClient
  ) {}

  static isPageObjectResponse(arg: any): arg is PageObjectResponse {
    return arg.object === 'page' && 'properties' in arg;
  }

  updateTitle(args: { pageId: string; title: string; propName?: string }) {
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
