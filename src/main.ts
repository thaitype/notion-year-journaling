import 'dotenv/config';
import { expressPlugin } from '@nammatham/express';
import simpleTimer from './functions/simple-timer';
import { app } from './nammatham';
import testTrigger from './functions/test-trigger';

app.addFunctions(simpleTimer, testTrigger);

app.register(
  expressPlugin({
    allowAllFunctionsAccessByHttp: true,
  })
);
app.start();
