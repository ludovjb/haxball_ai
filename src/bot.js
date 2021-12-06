const puppeteer = require('puppeteer');
const botCallbacks = require('./bot_callbacks.js');
const { refreshActionFunction } = require('./bot_functions.js');
const conf = require('./config.js');

const botId = parseInt(process.argv[2]);
if (!botId) {
    throw "Please provide a bot name as a first argument";
}

const roomLink = process.argv[3];
if (!roomLink) {
    throw "Please provide URL as a second argument";
}

const adminToken = process.argv[4];
if (!adminToken) {
    throw "Please provide an admin token as a third argument";
}

const bot = {
  id: botId,
  name: "Bot_"+botId,
  adminToken: adminToken
};

const roomPassword = process.argv[5];
let browser = null;

async function run () {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 2, height: 2 })
    await page.goto(roomLink);
    await page.waitForSelector("iframe");

    var frames = await page.frames();
    var myframe = frames.find(f => f.url().indexOf("__cache_static__/g/game.html") > -1);

    const inputName = await myframe.$("input[type=text]");
    await inputName.type(bot.name);
    const buttonName = await myframe.$("button");
    await buttonName.click();

    if(roomPassword) {
      const inputPassword = await myframe.$("input[data-hook=input]");
      await inputPassword.type(roomPassword);
      const buttonPassword = await myframe.$("button[data-hook=ok]");
      await buttonPassword.click();
    }

    try {
      await myframe.waitForSelector(".icon-menu");
    } catch (error) {
      console.error(error);
      await page.screenshot({path: bot.name+'.png'});
    }
    await myframe.waitForSelector(".icon-menu", {timeout: (999999999)});

    await sendChat(page, "/avatar ai");
    await sendChat(page, "!bot "+bot.adminToken+" "+bot.id);

    process.on('message', (message) => onServerMessage(message, page));

    while(await myframe.$(".icon-menu")) {
      await page.waitForTimeout(10000);
    }
    cleanExit();
}

async function sendChat(page, message) {
  await page.keyboard.press('Tab');
  await page.keyboard.type(message);
  await page.keyboard.press('Enter');
}

async function onServerMessage(message, page) {
  if(message.callback in botCallbacks && typeof botCallbacks[message.callback] === "function") {
    botCallbacks[message.callback](message.data, bot, page);
  }
  else {
    console.error("The following client callback function doesn't exist : "+message.callback);
  }
}

function cleanExit() {
  browser.close();
  console.log(bot.name+"'s process exited.");
  process.exit();
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

run();
