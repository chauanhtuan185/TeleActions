import { Context, Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { Update, InlineKeyboardButton } from '@telegraf/types';
import { connect, signTransaction } from '../services/phantomService';
import { ActionsURLMapper, ActionsJsonConfig } from "../types/types";
import { Handler } from '../lib/actions';
import axios from 'axios';
import { userConnections, successTransaction, phantomWalletPublicKey } from '../services/telegramService';
import { BOT_TOKEN } from '../config/constants';
import { Request, Response } from 'express';

export const bot: Telegraf<Context<Update>> = new Telegraf(BOT_TOKEN, {
  telegram: {
    apiRoot: "https://api.telegram.org",
    agent: undefined,
    webhookReply: true,
  },
});

bot.start((ctx) => {
  ctx.reply("Hello " + ctx.from.first_name + "!");
});

bot.on(message("text"), async (ctx) => {
  const messageText = ctx.message.text;
  const urlRegex = /(http[s]?:\/\/[^\s]+)/g;
  const userId = ctx.from.id;

  if (messageText.startsWith("/")) {
    return;
  }

  if (urlRegex.test(messageText)) {
    const parsedUrl = new URL(messageText);
    const origin = parsedUrl.origin;
    const handler = origin + "/actions.json";
    const fetchAction = await axios.get(handler);
    const actions: ActionsJsonConfig = fetchAction.data;
    const urlMapper = new ActionsURLMapper(actions);
    const actionApiUrl = urlMapper.mapUrl(messageText);
    if (actionApiUrl !== null) {
      const data = await Handler(actionApiUrl);
      const buttonHandler = data?.links?.actions;
      if (buttonHandler) {
        if (!userConnections.has(userId)) {
          const url = await connect();
          const redirectUrl = url;
          console.log("redirectUrl: ", redirectUrl);
          var msg = await ctx.replyWithPhoto(
            { url: data.icon },
            {
              caption: data.title,
              parse_mode: "Markdown",
              ...Markup.inlineKeyboard([
                Markup.button.url("Please connect Phantom Wallet", redirectUrl),
              ]),
            }
          );
          const checkConnection = async () => {
            if (phantomWalletPublicKey) {
              const inlineKeyboard: InlineKeyboardButton[] = [];
              for (let i = 0; i < buttonHandler.length; i++) {
                const action = buttonHandler[i];
                const actionApiUrlOrigin = new URL(actionApiUrl);
                if (action.parameters) {
                  const button = Markup.button.url(action.label, "http://sample.com");
                  continue;
                }
                const url = await signTransaction(action.href);

                const button = Markup.button.url(action.label, url);
                inlineKeyboard.push(button);
              }
              await ctx.telegram.editMessageCaption(
                msg.chat.id,
                msg.message_id,
                undefined,
                "User has connect",
                {
                  parse_mode: "Markdown",
                  ...Markup.inlineKeyboard(inlineKeyboard),
                }
              );
              userConnections.set(userId, true);
            } else {
              setTimeout(checkConnection, 500);
            }
          };
          const checkSign = async () => {
            console.log(successTransaction);
            if (successTransaction) {
              await ctx.telegram.editMessageCaption(
                msg.chat.id,
                msg.message_id,
                undefined,
                "Done!",
                {
                  parse_mode: "Markdown",
                  ...Markup.inlineKeyboard([Markup.button.url("View Transaction", "http://sample.com")]),
                }
              );
            } else {
              setTimeout(checkSign, 500);
            }
          };
          checkConnection();
          checkSign();
        }
      } else {
        ctx.reply("No URL detected in your message.");
      }
    }
  }
});

export const handleBotRequest = (_req: Request, res: Response) => {
  // Implement your request handling logic here
  res.send('Bot request handled');
};