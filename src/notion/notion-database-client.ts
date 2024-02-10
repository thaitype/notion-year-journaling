import { Client as NotionClient } from '@notionhq/client';
import {
  QueryDatabaseParameters,
  QueryDatabaseResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { DateProp, NumberProp, PageProperties, TitleProp, TypedPageObjectResponse } from './types';

/**
 * From @notionhq/client
 */
type WithAuth<P> = P & {
  auth?: string;
};

export class NotionDatabase<T extends Record<string, PageProperties['type']> = Record<string, PageProperties['type']>> {
  propTypes: T = {} as T;

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

  setPropTypes<const T extends Record<string, PageProperties['type']>>(props: T) {
    this.propTypes = {
      ...this.propTypes,
      ...props,
    }
    return this as unknown as NotionDatabase<T>;
  }

  /**
   * TODO: Handle pagination with Async Iterators later
   */
  // async query(args?: WithAuth<Omit<QueryDatabaseParameters, 'database_id'>>): Promise<PageObjectResponse[]> {
  async query(args?: any): Promise<TypedPageObjectResponse<MapResponseToNotionType<T>>[]> {
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      ...args,
    });
    const results = response.results.filter(page => NotionPage.isPageObjectResponse(page)) as TypedPageObjectResponse<MapResponseToNotionType<T>>[];
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

// export class JournalNotionDatabase<T extends Record<string, PageProperties['type']> = {}> {
//   props: T = {} as T;

//   schema<const T extends Record<string, PageProperties['type']>>(prop: T) {
//     return this as unknown as JournalNotionDatabase<T>;
//   }

//   validate() {
//     console.log('Validating schema');
//     return this;
//   }

//   build() {
//     this.validate();
//     return this as JournalNotionDatabase<T>;
//   }

//   query(): MapResponseToNotionType<T>[] {
//     return [] as any[];
//   }
// }

type MapResponseToNotionType<T extends Record<string, PageProperties['type']>> = {
  [K in keyof T]: MapTypeToNotionType<T[K]>;
};

type MapTypeToNotionType<T extends PageProperties['type']> = T extends NumberProp['type']
  ? NumberProp
  : T extends TitleProp['type']
  ? TitleProp
  : T extends DateProp['type']
  ? DateProp
  : never;

// export const db = new JournalNotionDatabase()
//   .schema({
//     Name: 'title',
//     Date: 'date',
//     Number: 'number',
//   })
//   .build();

// const pages = db.query();
// for (const page of pages) {
//   console.log(page['Date'].date?.start);
// }
