const puppeteer = require('puppeteer');
const { fork } = require('child_process');
const { createHaxballServer } = require('./haxserver.js')

const serverName = process.argv[2];
if (!serverName) {
    throw "Please provide a server name as a first argument";
}

const password = process.argv[3];
if (!password) {
    throw "Please provide a password as a second argument";
}

const recaptchaToken = process.argv[4]
if(!recaptchaToken) {
  throw "Please provide a repcaptcha token as a third argument";
}

const numberOfPlayers  = 2;
const players = [];
async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    //await page.setViewport({ width: 1900, height: 1024 })
    await page.goto("https://www.haxball.com/headless");
    await page.waitForFunction('window.HBInit');
    await page.waitForSelector('iframe');

    var frames = await page.frames();
    var myframe = frames.find(f => f.url().indexOf("__cache_static__/g/headless.html") > -1);
    //console.log("frame trouve");

    var playerJoined = function(playerName) {
      console.log(playerName);
    }

    await page.exposeFunction("letMeKnowPlayerHasJoined", (playerId) => {
        console.log("player has joined : "+playerId);
    });

    await page.exposeFunction("ballKicked", (number) => {
        console.log("ball has been kicked "+number +" times");
    });

    page.evaluate(createHaxballServer, serverName, password, recaptchaToken, playerJoined);

    try {
      await page.waitForSelector("#roomLink p a", {timeout: 3000});
    } catch (e) {
        console.log("Invalid token !")
        browser.close();
        return;
    }

    const roomLink = await myframe.evaluate(() => document.querySelector("#roomLink p a").innerText);
    console.log(roomLink);

    for(let p=0; p < numberOfPlayers; p++) {
      let playerName = "Bot_"+(p+1);
      const process = fork("./index.js", [roomLink, playerName]);// "+roomLink+" "+playerName);
      players.push(process);
    }



    while(true) {
      await page.waitForTimeout(3000);
    }
    browser.close();
}
run();
