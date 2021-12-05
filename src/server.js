const puppeteer = require('puppeteer');
const { fork } = require('child_process');
const conf = require('./config.js');
const { createHaxballRoom } = require('./haxserver.js')
const roomCallbacks = require('./server_callbacks.js')

let browser = null;
let bots = [];

async function launchServer(roomName, roomPassword, recaptchaToken, numberOfBotsPerTeam, redTeamActionFile, blueTeamActionFile, adminToken, vps, verbose) {
    var browserParams = { dumpio: verbose };
    if(vps) {
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

    page.evaluate(createHaxballRoom, roomName, roomPassword, recaptchaToken, adminToken);

    const selectorRoomLink = "#roomlink p a";
    try {
      await gameFrame.waitForSelector(selectorRoomLink, {timeout: 3000});
    } catch (e) {
        console.log("Invalid token ! ");
        browser.close();
        return;
    }

    const roomLink = await gameFrame.evaluate((selectorRoomLink) => document.querySelector(selectorRoomLink).innerText, selectorRoomLink);

    if(!vps) {
      const open = require('open');
      open(roomLink);
    }

    console.log("**************************************************")
    console.log("The room link is :");
    console.log("");
    console.log(roomLink);
    console.log("")
    console.log("The room password is : "+args.password);
    console.log("The admin token is : "+args.admin);
    console.log("**************************************************")

    var counter=0;
    for(let p = 0; p < numberOfBotsPerTeam; p++) {
      [redTeamActionFile, blueTeamActionFile].forEach((actionFile, i) => {
        counter += 1;
        let playerName = "Bot_"+counter;
        const child = fork("./src/bot.js", [roomLink, playerName, i+1, actionFile, adminToken, roomPassword]);
        bots.push(child);
        if(verbose) {
          console.log(playerName + " has been created and forked");
        }
      });
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

function checkPasswordValue(password) {
  if(password.length > 30) {
    console.error("Given password is too long (maxlength = 30). Default password ('"+conf.DEFAULT_PASSWORD+"') is set.");
    return conf.DEFAULT_PASSWORD;
  }
  return password;
}

function checkAIActionFile(fileName) {
  const relativeFileName = "../"+fileName;
  try {
    const { action } = require(relativeFileName);
  } catch (error) {
    console.error("An error has occured with the following action file : "+relativeFileName);
    console.error(error);
    process.exit(1);
  }
  return relativeFileName;
}

function cleanExit() {
  browser.close();
  bots.forEach(bot => {
    bot.kill('SIGINT');
  });
  bots = [];
  console.log("Server exited.")
  process.exit();
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill


module.exports = { launchServer, checkPasswordValue, checkAIActionFile };
