import dayjs from 'dayjs';
import { Logger } from '../types';
import { DailyJournalDatabase } from '../bootstrap';

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
  constructor(protected dailyJournalDb: DailyJournalDatabase, options: NotionServiceOptions) {
    this.logger = options.logger ?? console;
  }

  async updateDateToTitle(options?: UpdateDateTitleOptions) {
    const numberPassedDays = options?.numberPassedDays ?? 7;
    const numberFutureDays = options?.numberFutureDays ?? 2;
    const pages = await this.dailyJournalDb.query(props => ({
      filter: {
        and: [
          props['Date'].rule({
            date: {
              is_not_empty: true,
            },
          }),
          props['Date'].rule({
            date: {
              on_or_after: dayjs(new Date()).subtract(numberPassedDays, 'day').toISOString(),
            },
          }),
          props['Date'].rule({
            date: {
              on_or_before: dayjs(new Date()).add(numberFutureDays, 'day').toISOString(),
            },
          }),
        ],
      },
    }));
    for (const page of pages) {
      const props = page.properties;
      const title = props['Name'].title[0]?.plain_text?.trim();
      const dateString = props['Date'].date?.start;
      const newTitle = dayjs(dateString, 'YYYY-MM-DD').format('MMM DD, YYYY');
      if (title === newTitle) {
        this.logger.info(`Skipping date: ${dateString} with id: ${page.id}`);
        continue;
      }
      this.logger.info(`Updating title of date: ${dateString} to '${newTitle}', with id: ${page.id}`);
      await this.dailyJournalDb.page.updateTitle({ pageId: page.id, title: newTitle });
      this.logger.info(`Updated title`);
    }
    return `Updated ${numberPassedDays} days before and ${numberFutureDays} days after today, please check your Notion database.`;
  }
}
