var vec = require('./vectors.js')

const SPECTATORS = 0;
const RED_TEAM = 1;
const BLUE_TEAM = 2;

const keyHold = {};

async function applyAction(team, actionName, page) {
  if(team != RED_TEAM && team != BLUE_TEAM) {
    await resetAllKeysExceptFor(page); // FIXME useful ?
    return;
  }

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

async function pressKeys(page, ...commandKeys) {
  await resetAllKeysExceptFor(page, ...commandKeys);
  commandKeys.forEach(async (commandKey, i) => {
    if(!(commandKey in keyHold) || !keyHold[commandKey]) {
      await page.keyboard.down(commandKey);
      keyHold[commandKey] = true;
    }
  });
}

async function resetAllKeysExceptFor(page, ...exceptions) {
  Object.keys(keyHold).forEach(async (commandKey, i) => {
    if(keyHold[commandKey] && !exceptions.includes(commandKey)) {
      await page.keyboard.up(commandKey);
      keyHold[commandKey] = false;
    }
  });
}

function getBotRelativeGameEnv(lastData, currentData, botName) {
  var localPlayer = Object.values(currentData.players).find((player) => player.name == botName);
  if(!localPlayer || !localPlayer.position) {
    return null;
  }

  var botVelocity;
  if(lastData && lastData.players[localPlayer.id]) {
    botVelocity = vec.div(vec.sub(lastData.players[localPlayer.id].position, localPlayer.position), lastData.tickNumber - currentData.tickNumber);
  }
  else {
    botVelocity = { x: 0, y: 0 };
  }

  var ballVelocity;
  if(lastData) {
    ballVelocity = vec.div(vec.sub(lastData.ball, currentData.ball), lastData.tickNumber - currentData.tickNumber);
  }
  else {
    ballVelocity = { x: 0, y: 0 };
  }

  var relativeEnv = {
    tick: currentData.tickNumber,
    bot: {
      id: localPlayer.id,
      team: localPlayer.team,
      position: localPlayer.position,
      velocity: botVelocity
    },
    ball: {
      position: vec.sub(currentData.ball, localPlayer.position),
      velocity: ballVelocity,
    },
    teammates: [],
    opponents: []
  };


  Object.values(currentData.players).forEach((player) => {
    if(player.id == localPlayer.id) {
      return;
    }

    if(!player.position || player.team == SPECTATORS) {
      return;
    }

    var playerVelocity;
    if(lastData && lastData.players[player.id]) {
      playerVelocity = vec.div(vec.sub(lastData.players[player.id].position, localPlayer.position), lastData.tickNumber - currentData.tickNumber);
    }
    else {
      playerVelocity = { x: 0, y: 0 };
    }

    var relativePlayerInfo = {
      id: player.id,
      position: vec.sub(player.position, localPlayer.position),
      velocity: playerVelocity
    };

    (player.team == localPlayer.team ? relativeEnv.teammates : relativeEnv.opponents).push(relativePlayerInfo);
  });

  if(localPlayer.team == BLUE_TEAM) {
    reverseVectors(relativeEnv);
  }
  return relativeEnv;
}

function reverseVectors(object) {
  if(typeof object === 'object') {
    if("x" in object && "y" in object && Object.keys(object).length == 2) {
      object.x *= -1;
      object.y *= -1;
    }
    else {
      Object.keys(object).forEach((key) => {
        reverseVectors(object[key]);
      });
    }
  }
  else if(Array.isArray(object)) {
    object.forEach((arrayObject) => {
      reverseVectors(arrayObject);
    });
  }
}

module.exports = { applyAction, resetAllKeysExceptFor, getBotRelativeGameEnv }
