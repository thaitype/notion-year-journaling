import { InvocationContext } from '@azure/functions';

import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import dayjs from 'dayjs';
import { NotionDatabase, NotionPage } from '../notion/notion-database-client';
import { Logger } from '../types';

function isPageObjectResponse(arg: any): arg is PageObjectResponse {
  return arg.object === 'page' && 'properties' in arg;
}

export interface UpdateDateTitleOptions {
  /**
   * Number of days to go back from today
   *
   * @default 7
   */
  numberPassedDays?: number;
  /**
   * Number of days to go forward from today
   *
   * @default 2
   */
  numberFutureDays?: number;
}

export interface NotionServiceOptions {
  logger?: Logger;
}

export class YearJournalService {
  private readonly logger: Logger;
  constructor(protected dailyJournalDb: NotionDatabase, options: NotionServiceOptions) {
    this.logger = options.logger ?? console;
  }

  async updateDateToTitle(options?: UpdateDateTitleOptions) {
    const numberPassedDays = options?.numberPassedDays ?? 7;
    const numberFutureDays = options?.numberFutureDays ?? 2;
    const response = await this.dailyJournalDb.query({
      filter: {
        and: [
          {
            property: 'Date',
            date: {
              is_not_empty: true,
            },
          },
          {
            property: 'Date',
            date: {
              on_or_after: dayjs(new Date()).subtract(numberPassedDays, 'day').toISOString(),
            },
          },
          {
            property: 'Date',
            date: {
              on_or_before: dayjs(new Date()).add(numberFutureDays, 'day').toISOString(),
            },
          },
        ],
      },
    });
    for (const page of response.results) {
      if (isPageObjectResponse(page)) {
        if (page.properties['Date'].type === 'date') {
          if (!page.properties['Date'].date) continue;
          const title =
            page.properties['Name'].type === 'title' ? page.properties['Name'].title[0]?.plain_text?.trim() : '';
          const dateString = page.properties['Date'].date.start;
          const newTitle = dayjs(dateString, 'YYYY-MM-DD').format('MMM DD, YYYY');
          if (title === newTitle) {
            this.logger.info(`Skipping date: ${dateString} with id: ${page.id}`);
            continue;
          }
          this.logger.info(`Updating title of date: ${dateString} to '${newTitle}', with id: ${page.id}`);
          await this.dailyJournalDb.page.updateTitle({ pageId: page.id, title: newTitle });
          this.logger.info(`Updated title`);
        }
      }
    }
    return `Updated ${numberPassedDays} days before and ${numberFutureDays} days after today, please check your Notion database.`;
  }
}
