const puppeteer = require('puppeteer');
const { fork } = require('child_process');
const open = require('open');
const { createHaxballServer } = require('./haxserver.js')

const roomName = process.argv[2];
if (!roomName) {
    throw "Please provide a room name as a first argument";
}

const roomPassword = process.argv[3];
if (!roomPassword) {
    throw "Please provide a room password as a second argument";
}

const recaptchaToken = process.argv[4]
if(!recaptchaToken) {
  throw "Please provide a repcaptcha token as a third argument";
}

const numberOfPlayers = 2;
let players = [];

var gameCallbacks = {}
gameCallbacks.onGameTick = async function(data) {
  //if(data.tickNumber % 10 == 0) {
    //console.log("TICK : "+data.tickNumber + " ball x="+data.ball.x+" y="+data.ball.y);
    /*data.players.forEach((player, i) => {
      if(player.position == null)
        return;
      console.log("    "+player.name + " x="+player.position.x+" y="+player.position.y);
    });*/
    players.forEach(child => child.send({ callback: "onGameTick", data: data }));
  //}
}

gameCallbacks.onPlayerChat = async function(data) {
  console.log(data);
  players.forEach(child => child.send({ callback: "onPlayerChat", data: data }));
}

gameCallbacks.onPlayerJoin = async function(data) {
  console.log(data + " has joined the server");
}

async function onGameMessage(callback, data) {
  if(callback in gameCallbacks && typeof gameCallbacks[callback] === "function") {
    gameCallbacks[callback](data);
  }
  else {
    console.log("The following callback function doesn't exist : "+callback);
  }
}

async function launchServer(roomName, roomPassword, recaptchaToken, verbose=false) {
    const browser = await puppeteer.launch( { dumpio: true });
    const page = await browser.newPage();

    await page.setViewport({ width: 2, height: 2 })
    await page.goto("https://www.haxball.com/headless");
    await page.waitForFunction('window.HBInit');
    await page.waitForSelector('iframe');

    var frames = await page.frames();
    var myframe = frames.find(f => f.url().indexOf("__cache_static__/g/headless.html") > -1);

    await page.exposeFunction("messageToServer", onGameMessage);

    page.evaluate(createHaxballServer, roomName, roomPassword, recaptchaToken);

    const selectorRoomLink = "#roomlink p a";
    try {
      await myframe.waitForSelector(selectorRoomLink, {timeout: 3000});
    } catch (e) {
        console.log("Invalid token ! ");
        browser.close();
        return;
    }

    const roomLink = await myframe.evaluate((selectorRoomLink) => document.querySelector(selectorRoomLink).innerText, selectorRoomLink);
    console.log(roomLink);
    open(roomLink);

    for(let p = 0; p < numberOfPlayers; p++) {
      let playerName = "Bot_"+(p+1);
      const child = fork("./src/client.js", [roomLink, playerName]);
      players.push(child);
      console.log(playerName + " has been created and forked");
    }

    while(true) {
      await page.waitForTimeout(3000);
    }
    browser.close();
}

launchServer(roomName, roomPassword, recaptchaToken, true);
