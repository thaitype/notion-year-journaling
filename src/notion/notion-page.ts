import { Client as NotionClient } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type {
  PageParent,
} from './types';
import invariant from 'tiny-invariant';

export class NotionPage {
  constructor(
    /**
     * The Notion Client
     */
    public readonly notion: NotionClient,
    /**
     * Parent of the page
     */
    public readonly parent?: PageParent
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

  /**
   * Create a Notion Page
   *
   * Ref: https://developers.notion.com/reference/post-page
   */
  create(args: { title: string }){
    invariant(this.parent, `Parent is required to create a page`);
    return this.notion.pages.create({
      parent: this.parent,
      properties: {
        Name: {
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
