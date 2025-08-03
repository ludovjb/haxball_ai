import puppeteer from "puppeteer";
import * as botCallbacks from "./bot_callbacks.js";
import * as promises from "node:timers/promises";
import * as os from 'os';
import { subscribe } from "./natsClient.js";

const hostname = os.hostname();

let bot = null;

let browser = null;

export async function launchAgent(roomLink, adminToken, roomPassword) {
  await promises.setTimeout(5000);
  bot = {
    name: "bot-" + hostname,
    adminToken: adminToken,
  }
  console.log(`Bot ${bot.name} is coming...`);

  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  await page.goto(roomLink);
  await page.waitForSelector("iframe");
  var frames = await page.frames();
  var myframe = frames.find(
    (f) => f.url().indexOf("__cache_static__/g/game.html") > -1,
  );

  const inputName = await myframe.$("input[data-hook=input]");
  await inputName.type(bot.name);

  // await page.screenshot({ path: `example-bot-${bot.name}.png`, fullPage: true });
  // console.log("screenschot")
  const buttonName = await myframe.$("button");
  await buttonName.click();
  console.log(`Bot ${bot.name}: name entered`);

  if (roomPassword) {
    const inputPassword = await myframe.$("input[data-hook=input]");
    await inputPassword.type(roomPassword);
    const buttonPassword = await myframe.$("button[data-hook=ok]");
    await buttonPassword.click();
    console.log(`Bot ${bot.name}: password entered`);
  }


  try {
    await myframe.waitForSelector(".icon-menu");
  } catch (error) {
    console.error(error);
    await page.screenshot({ path: bot.name + ".png" });
  }
  await myframe.waitForSelector(".icon-menu", { timeout: 999999999 });
  console.log(`Bot ${bot.name}: room entered`);

  await sendChat(page, "/avatar ai");
  await sendChat(page, "!bot " + bot.adminToken + " " + bot.name);

  subscribe("backend.message", async (message) => onServerMessage(message, page))

  console.log(`Bot ${bot.name}: authenticated`);

  while (await myframe.$(".icon-menu")) {
    await promises.setTimeout(4000);
  }
  // cleanExit();
}

async function sendChat(page, message) {
  await page.keyboard.press("Tab");
  await page.keyboard.type(message);
  await page.keyboard.press("Enter");
}

async function onServerMessage(message, page) {
  if (
    message.callback in botCallbacks &&
    typeof botCallbacks[message.callback] === "function"
  ) {
    botCallbacks[message.callback](message.data, bot, page);
  } else {
    console.error(
      "The following client callback function doesn't exist : " +
        message.callback,
    );
  }
}

function cleanExit() {
  browser.close();
  console.log(bot.name + "'s process exited.");
  process.exit();
}
process.on("SIGINT", cleanExit); // catch ctrl-c
process.on("SIGTERM", cleanExit); // catch kill
