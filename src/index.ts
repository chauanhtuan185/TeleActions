import express from 'express';
import bodyParser from 'body-parser';
import { PORT } from './config/constants';
import { bot } from './controllers/botController';
import transactionApp from './controllers/transactionController';

const app = express();
app.use(bodyParser.json());

app.use(transactionApp);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));