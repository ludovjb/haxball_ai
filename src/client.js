const puppeteer = require('puppeteer');
const botCallbacks = require('./bot_callbacks.js');

const url = process.argv[2];
if (!url) {
    throw "Please provide URL as a first argument";
}

const bot = {
  name: process.argv[3]
};

if (!bot.name) {
    throw "Please provide a bot name as a third argument";
}

const roomPassword = process.argv[4];

async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 2, height: 2 })
    await page.goto(url);
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
    await page.keyboard.press('Tab');
    await page.keyboard.press('/');
    await page.keyboard.press('a');
    await page.keyboard.press('v');
    await page.keyboard.press('a');
    await page.keyboard.press('t');
    await page.keyboard.press('a');
    await page.keyboard.press('r');
    await page.keyboard.press(' ');
    await page.keyboard.press('a');
    await page.keyboard.press('i');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    process.on('message', (message) => onServerMessage(message, page));

    while(await myframe.$(".icon-menu")) {
      await page.waitForTimeout(10000);
    }
    console.log("End of connection for "+bot.name);
    browser.close();
}

async function onServerMessage(message, page) {
  if(message.callback in botCallbacks && typeof botCallbacks[message.callback] === "function") {
    botCallbacks[message.callback](message.data, bot, page);
  }
  else {
    console.error("The following client callback function doesn't exist : "+message.callback);
  }
}

run();
