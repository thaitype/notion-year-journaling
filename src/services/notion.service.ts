import { InvocationContext } from '@azure/functions';
import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import dayjs from 'dayjs';
const notion = new Client({ auth: process.env.NOTION_KEY });

function isPageObjectResponse(arg: any): arg is PageObjectResponse {
  return arg.object === 'page' && 'properties' in arg;
}

const dailyJournalDatabaseId = process.env.DAILY_JOURNAL_DATABASE_ID ?? '';

export const updatePageProp = async (pageId: string, title: string) => {

  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      'Name': {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    },
  });
  return response;
}

export const updateDateToTitleWithinPassWeek = async (context: InvocationContext) => {
  const databaseId = dailyJournalDatabaseId;
  const response = await notion.databases.query({
    database_id: databaseId,
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
            on_or_after: dayjs(new Date()).subtract(7, 'day').toISOString() ,
          }
        },
        {
          property: 'Date',
          date: {
            on_or_before: dayjs(new Date()).add(2, 'day').toISOString() ,
          }
        },
      ],
    },
  });
  for (const page of response.results) {
    if (isPageObjectResponse(page)) {
      if (page.properties['Date'].type === 'date') {
        if (!page.properties['Date'].date) continue;
        const title = page.properties['Name'].type === 'title' ? page.properties['Name'].title[0]?.plain_text?.trim() : '';
        const dateString = page.properties['Date'].date.start;
        const newTitle = dayjs(dateString, 'YYYY-MM-DD').format('MMM DD, YYYY');
        if(title === newTitle) {
          context.log(`Skipping date: ${dateString} with id: ${page.id}`);
          continue;
        }
        context.log(`Updating title of date: ${dateString} to '${newTitle}', with id: ${page.id}`);
        await updatePageProp(page.id, newTitle);
        context.log(`Updated title`);
      }
    }

  }
};
