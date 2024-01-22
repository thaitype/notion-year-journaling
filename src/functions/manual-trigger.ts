import { func } from '../nammatham';
import { updateDateToTitle } from '../services/notion.service';

function parseIntOrUndefined(s: string | undefined) {
  if (s === undefined) {
    return undefined;
  }
  return Number.parseInt(s);
}

export default func
  .httpGet('manual', {
    authLevel: 'function'
  })
  .handler(async ({ trigger, context }) => {
    const numberPassedDays = parseIntOrUndefined(trigger.query.get('numberPassedDays') ?? undefined);
    const numberFutureDays = parseIntOrUndefined(trigger.query.get('numberFutureDays') ?? undefined);
    const result = await updateDateToTitle(context, {
      numberPassedDays,
      numberFutureDays,
    });
    return {
      body: result
    }
  });
