import { dailyJournalDb } from '../bootstrap';
import { func } from '../nammatham';
import { YearJournalService } from '../services/notion.service';

function parseIntOrUndefined(s: string | undefined) {
  if (s === undefined) {
    return undefined;
  }
  return Number.parseInt(s);
}

export default func
  .httpGet('manual', {
    authLevel: 'function',
  })
  .handler(async ({ trigger, context }) => {
    const numberPassedDays = parseIntOrUndefined(trigger.query.get('numberPassedDays') ?? undefined);
    const numberFutureDays = parseIntOrUndefined(trigger.query.get('numberFutureDays') ?? undefined);
    // const yearJournalService = new YearJournalService(dailyJournalDb, {
    //   logger: context,
    // });
    // const result = await yearJournalService.updateDateToTitle({
    //   numberPassedDays,
    //   numberFutureDays,
    // });
    // await dailyJournalDb.page.create({
    //   title: 'Hello World',
    // });
    return {
      body: '',
    };
  });
