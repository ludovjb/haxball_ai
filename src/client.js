const puppeteer = require('puppeteer');
const url = process.argv[2];
if (!url) {
    throw "Please provide URL as a first argument";
}

const playerName = process.argv[3];
if (!playerName) {
    throw "Please provide a player name as a third argument";
}

const roomPassword = process.argv[4];

const RED_TEAM = 1;
const BLUE_TEAM = 2;
const keyHold = {};

var messageCallbacks = {}

async function onServerMessage(message, page) {
  if(message.callback in messageCallbacks && typeof messageCallbacks[message.callback] === "function") {
    messageCallbacks[message.callback](message.data, page);
  }
  else {
    console.log("The following callback function doesn't exist : "+message.callback);
  }
}

messageCallbacks.onGameTick = async function(data, page) {
  //await action(2, message.direction, page);
  var localPlayer = data.players.find((player) => player.name == playerName);
  if(localPlayer.position == null) {
    return;
  }

  if(data.ball.x == 0.0 && data.ball.y == 0.0) {
    await resetAllKeysExceptFor(page);
  }

  ballX = (data.ball.x - localPlayer.position.x);
  ballY = (data.ball.y - localPlayer.position.y);
  if(localPlayer.team == 2) {
    ballX *= -1;
    ballY *= -1;
  }



  let distanceWithBall = Math.sqrt(Math.pow(ballX, 2)+Math.pow(ballY, 2));
  if(distanceWithBall < 25.5) {
    await action(localPlayer.team, "kick", page);
  }


  if(ballX >= 0 && ballY >= 0) {
    await action(localPlayer.team, "forward-right", page);
  }
  else if(ballX <= 0 && ballY >= 0) {
    await action(localPlayer.team, "backward-right", page);
  }
  else if(ballX >= 0 && ballY <= 0) {
    await action(localPlayer.team, "forward-left", page);
  }
  else if(ballX <= 0 && ballY <= 0) {
    await action(localPlayer.team, "backward-left", page);
  }
}

messageCallbacks.onPlayerChat = async function(data, page) {
  await resetAllKeysExceptFor(page);
}

async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 2, height: 2 })
    await page.goto(url);
    await page.waitForSelector("iframe");

    var frames = await page.frames();
    var myframe = frames.find(f => f.url().indexOf("__cache_static__/g/game.html") > -1);

    const inputName = await myframe.$("input[type=text]");
    await inputName.type(playerName);
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
      await page.screenshot({path: playerName+'.png'});
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
    console.log("End of connection for "+playerName);
    browser.close();
}

function getOppositeCommand(commandKey) {
  switch (commandKey) {
    case "ArrowUp":
      return "ArrowDown";
    case "ArrowRight":
      return "ArrowLeft";
    case "ArrowDown":
      return "ArrowUp";
    case "ArrowLeft":
      return "ArrowRight";
  }
}

async function action(team, actionName, page) {
  if(team != RED_TEAM && team != BLUE_TEAM) {
    await resetAllKeysExceptFor(page);
    return;
  }
  //console.log(actionName);
  switch(actionName) {
    case "kick": case "k":
      await pressKeys(page, getCommandKeys(team, "kick"));
      break;
    case "forward": case "f":
      await pressKeys(page, getCommandKeys(team, "forward"));
      break;
    case "backward": case "b":
      await pressKeys(page, getCommandKeys(team, "backward"));
      break;
    case "left": case "l":
      await pressKeys(page, getCommandKeys(team, "left"));
      break;
    case "right": case "r":
      await pressKeys(page, getCommandKeys(team, "right"));
      break;
    case "forward-left": case "fl":
      await pressKeys(page, getCommandKeys(team, "forward"), getCommandKeys(team, "left"));
      break;
    case "forward-right": case "fr":
      await pressKeys(page, getCommandKeys(team, "forward"), getCommandKeys(team, "right"));
      break;
    case "backward-left": case "bl":
      await pressKeys(page, getCommandKeys(team, "backward"), getCommandKeys(team, "left"));
      break;
    case "backward-right": case "br":
      await pressKeys(page, getCommandKeys(team, "backward"), getCommandKeys(team, "right"));
      break;
    default: // none
      await resetAllKeysExceptFor(page);
      break;
  }
}

function getCommandKeys(team, commandName) {
  switch (commandName) {
    case "forward":
      return team == RED_TEAM ? "ArrowRight" : getOppositeCommand("ArrowRight");
    case "backward":
      return team == RED_TEAM ? "ArrowLeft" : getOppositeCommand("ArrowLeft");
    case "right":
      return team == RED_TEAM ? "ArrowDown" : getOppositeCommand("ArrowDown");
    case "left":
      return team == RED_TEAM ? "ArrowUp" : getOppositeCommand("ArrowUp");
    case "kick":
      return "Space";
  }
}


async function pressKeys(page, ...commandKeys) {
  await resetAllKeysExceptFor(page, ...commandKeys);
  commandKeys.forEach(async (commandKey, i) => {
    if(!(commandKey in keyHold) || !keyHold[commandKey]) {
      await page.keyboard.down(commandKey);
      keyHold[commandKey] = true;
      //console.log(" press "+commandKey)
    }
    /*else {
      console.log(" not press "+commandKey);
    }*/
  });
}

async function resetAllKeysExceptFor(page, ...exceptions) {
  Object.keys(keyHold).forEach(async (commandKey, i) => {
    if(keyHold[commandKey] && !exceptions.includes(commandKey)) {
      await page.keyboard.up(commandKey);
      keyHold[commandKey] = false;
      //console.log(" reset "+commandKey)
    }
  });
}

// Causes the parent to print: PARENT got message: { foo: 'bar', baz: null }
process.send({ foo: 'bar', baz: NaN });
run();
