const puppeteer = require('puppeteer');
const conf = require('./config.js');
const { createHaxballRoom } = require('./haxserver.js');
const roomCallbacks = require('./server_callbacks.js');
const { createBot, sendMessageToAllBots } = require('./server_functions.js');

let browser = null;
let server = {};

async function launchServer(args) {
    Object.assign(server, args);

    var browserParams = { dumpio: server.verbose };
    if(server.vps) {
      browserParams.args = ["--disable-features=WebRtcHideLocalIpsWithMdns"];
    }
    browser = await puppeteer.launch(browserParams);
    const page = await browser.newPage();

    await page.setViewport({ width: 2, height: 2 })
    await page.goto("https://www.haxball.com/headless");
    await page.waitForFunction('window.HBInit');
    await page.waitForSelector('iframe');

    var frames = await page.frames();
    var gameFrame = frames.find(f => f.url().indexOf("__cache_static__/g/headless.html") > -1);

    await page.exposeFunction("messageToServer", onRoomMessage);

    page.evaluate(createHaxballRoom, server.name, server.password, server.token, server.admin);

    const selectorRoomLink = "#roomlink p a";
    try {
      await gameFrame.waitForSelector(selectorRoomLink, {timeout: 3000});
    } catch (e) {
        console.log("Invalid token ! ");
        browser.close();
        return;
    }

    server.roomLink = await gameFrame.evaluate((selectorRoomLink) => document.querySelector(selectorRoomLink).innerText, selectorRoomLink);

    if(!server.vps) {
      const open = require('open');
      open(server.roomLink);
    }

    console.log("**************************************************")
    console.log("The room link is :");
    console.log("");
    console.log(server.roomLink);
    console.log("")
    console.log("The room password is : " + server.password);
    console.log("The admin token is : " + server.admin);
    console.log("**************************************************")

    server.numberOfBots = server.bots * 2;
    server.bots = {};
    for(let p = 0; p < server.numberOfBots; p++) {
      createBot(server);
    }

    if(server.nocache) {
      setInterval(() => sendMessageToAllBots(server.bots, "onActionFileRefresh", { actionFile: server.redteam }), 1500);
    }

    while(true) {
      await page.waitForTimeout(3000);
    }
    browser.close();
}

async function onRoomMessage(callback, data) {
  if(callback in roomCallbacks && typeof roomCallbacks[callback] === "function") {
    roomCallbacks[callback](data, server);
  }
  else {
    console.error("The following server callback function doesn't exist : "+callback);
  }
}

function cleanExit() {
  browser.close();
  Object.values(server.bots).forEach(bot => {
    bot.kill('SIGINT');
  });
  console.log("Server exited.")
  process.exit();
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill


module.exports = { launchServer };
