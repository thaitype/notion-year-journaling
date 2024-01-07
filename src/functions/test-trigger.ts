import { func } from '../nammatham';
import { updateDateToTitleWithinPassWeek } from '../services/notion.service';

export default func
  .httpGet('test', {
    authLevel: 'function'
  })
  .handler(async ({ context }) => {
    await updateDateToTitleWithinPassWeek(context);
    return {
      body: 'Run successfully, please check the logs.'
    }
  });
