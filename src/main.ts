import 'dotenv/config';
import { expressPlugin } from 'nammatham';
import simpleTimer from './functions/simple-timer';
import { app } from './nammatham';
import testTrigger from './functions/test-trigger';

app.addFunctions(simpleTimer, testTrigger);

const dev = process.env.NODE_ENV === 'development';
app.register(
  expressPlugin({
    dev,
    allowAllFunctionsAccessByHttp: true,
  })
);
app.start();
