const puppeteer = require('puppeteer');
const { fork } = require('child_process');
const { createHaxballRoom } = require('./haxserver.js')
const roomCallbacks = require('./server_callbacks.js')

let bots = [];

async function launchServer(roomName, roomPassword, recaptchaToken, numberOfBots, vps, verbose) {
    var browserParams = { dumpio: verbose };
    if(vps) {
      browserParams.args = ["--disable-features=WebRtcHideLocalIpsWithMdns"];
    }
    const browser = await puppeteer.launch(browserParams);
    const page = await browser.newPage();

    await page.setViewport({ width: 2, height: 2 })
    await page.goto("https://www.haxball.com/headless");
    await page.waitForFunction('window.HBInit');
    await page.waitForSelector('iframe');

    var frames = await page.frames();
    var gameFrame = frames.find(f => f.url().indexOf("__cache_static__/g/headless.html") > -1);

    await page.exposeFunction("messageToServer", onRoomMessage);

    page.evaluate(createHaxballRoom, roomName, roomPassword, recaptchaToken);

    const selectorRoomLink = "#roomlink p a";
    try {
      await gameFrame.waitForSelector(selectorRoomLink, {timeout: 3000});
    } catch (e) {
        console.log("Invalid token ! ");
        browser.close();
        return;
    }

    const roomLink = await gameFrame.evaluate((selectorRoomLink) => document.querySelector(selectorRoomLink).innerText, selectorRoomLink);
    console.log(roomLink);

    if(!vps) {
      const open = require('open');
      open(roomLink);
    }

    for(let p = 0; p < numberOfBots; p++) {
      let playerName = "Bot_"+(p+1);
      const child = fork("./src/client.js", [roomLink, playerName, roomPassword]);
      bots.push(child);
      console.log(playerName + " has been created and forked");
    }

    while(true) {
      await page.waitForTimeout(3000);
    }
    browser.close();
}

async function onRoomMessage(callback, data) {
  if(callback in roomCallbacks && typeof roomCallbacks[callback] === "function") {
    roomCallbacks[callback](data, bots);
  }
  else {
    console.error("The following server callback function doesn't exist : "+callback);
  }
}

module.exports = { launchServer };
