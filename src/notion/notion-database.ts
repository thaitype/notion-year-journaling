import { Client as NotionClient } from '@notionhq/client';
import type { QueryDatabaseParameters, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type {
  CommonTypeFilter,
  MapResponseToNotionType,
  MapTypePropertyFilter,
  PageProperties,
  TypedPageObjectResponse,
  WithAuth,
} from './types';

export type InferPropTypes<T> = T extends NotionDatabase<infer U> ? U : never;
export type InferNotionDatabase<T> = NotionDatabase<InferPropTypes<T>>;

// export type NotionDatabaseQueryArgs<T extends Record<string, PageProperties['type']>> = WithAuth<Omit<TypedQueryDatabaseParameters<T>, 'database_id'>>;
export type NotionDatabaseQueryArgs = WithAuth<Omit<QueryDatabaseParameters, 'database_id'>>;
export type QueryPredidcate<T extends Record<string, PageProperties['type']>> = (
  props: MapTypePropertyFilter<T>
) => NotionDatabaseQueryArgs;

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
    };
    return this as unknown as NotionDatabase<T>;
  }

  /**
   * Make sure the propType is correct
   */

  async validate() {
    if (Object.values(this.propTypes).length === 0) {
      console.log(`Skipping validate because no prop type provided`);
      return this;
    }

    const response = await this.notion.databases.retrieve({ database_id: this.databaseId });
    const remoteProps = response.properties;
    for (const [propName, propType] of Object.entries(this.propTypes)) {
      if (!remoteProps[propName]) {
        throw new Error(`No property "${propName}" defined in Notion Database Properties`);
      }
      if (propName !== remoteProps[propName]?.name) {
        throw new Error(
          `Both key and name property should be same!, please check the notion API response schema, https://api.notion.com/v1/databases/{database_id}`
        );
      }

      if (propType !== remoteProps[propName]?.type) {
        throw new Error(
          `The property "${propName}" don't match type, (Expected: "${propType}", Actual: "${remoteProps[propName]?.type}")`
        );
      }
    }
    console.log('Schema Validated');
    return this;
  }

  /**
   * TODO: Handle pagination with Async Iterators later
   */
  async query(
    func?: QueryPredidcate<T> | NotionDatabaseQueryArgs
  ): Promise<TypedPageObjectResponse<MapResponseToNotionType<T>>[]> {
    await this.validate();
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      ...(this.processQueryPredicate(func) ?? {}),
    });
    const results = response.results.filter(page => NotionPage.isPageObjectResponse(page)) as TypedPageObjectResponse<
      MapResponseToNotionType<T>
    >[];
    return results;
  }

  protected processQueryPredicate(
    funcOrArgs?: QueryPredidcate<T> | NotionDatabaseQueryArgs
  ): NotionDatabaseQueryArgs | undefined {
    if (funcOrArgs === undefined) return undefined;
    if (typeof funcOrArgs !== 'function') return funcOrArgs;
    const injectProps: Record<string, unknown> = {};
    for (const [propName, propType] of Object.entries(this.propTypes)) {
      injectProps[propName] = {
        filter: (filterProp: Record<string, unknown>) =>
          ({
            ...filterProp,
            property: propName,
            type: propType,
          } as CommonTypeFilter),
      };
    }
    return funcOrArgs(injectProps as MapTypePropertyFilter<T>);
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
