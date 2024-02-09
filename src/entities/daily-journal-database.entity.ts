/**
 * The daily journal database entity.
 *
 * This should be match with Notion Database Properties.
 */
export interface DailyJournalDatabaseEntity {
  /**
   * Page Title
   */
  Name: string;
  Date: Date;
}

const DailyJournalDbProps = {
  Name: 'Name',
  Date: 'Date',
} as const;


// DailyJournalDbProps.Date

