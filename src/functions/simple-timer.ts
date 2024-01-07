import { func } from '../nammatham';
import { updateDateToTitleWithinPassWeek } from '../services/notion.service';

export default func
  .timer('watcher', {
    /**
     * Every hour
     */
    schedule: '0 0 * * * *',
  })
  .handler(async ({ trigger, context }) => {
    context.info('Timer triggered!');
    trigger.isPastDue ? context.info('Timer is past due!') : null;
    await updateDateToTitleWithinPassWeek(context);
  });
