import { fork } from "child_process";
import * as conf from "./config.js";

export function checkPasswordValue(password) {
  if (password.length > 30) {
    console.error(
      "Given password is too long (maxlength = 30). Default password ('" +
        conf.DEFAULT_PASSWORD +
        "') is set.",
    );
    return conf.DEFAULT_PASSWORD;
  }
  return password;
}

export async function checkAIActionFile(fileName) {
  try {
    await import(fileName);
  } catch (error) {
    console.error(
      "An error has occurred with the following action file: " + fileName,
    );
    console.error("ERROR " + error);
    process.exit(1);
  }

  return fileName;
}

var counterBots = 0;
export function createBot(server) {
  var botId = ++counterBots;
  const child = fork("./src/bot.js", [
    botId,
    server.roomLink,
    server.admin,
    server.password,
  ]);
  server.bots[botId] = child;
  if (server.verbose) {
    console.log("Bot id " + botId + " has been created and forked");
  }
  return botId;
}

export async function sendMessageToAllBots(bots, callbackName, data) {
  Object.values(bots).forEach(async (bot) =>
    bot.send({ callback: callbackName, data: data }),
  );
}

export async function sendMessageToBot(bot, callbackName, data) {
  bot.send({ callback: callbackName, data: data });
}
