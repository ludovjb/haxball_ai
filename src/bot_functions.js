const conf = require('./config.js');
var vec = require('./vectors.js')


const keyHold = {};

async function applyAction(team, actionName, page) {
  if(team != conf.RED_TEAM && team != conf.BLUE_TEAM) {
    await resetAllKeysExceptFor(page);
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
      return team == conf.RED_TEAM ? "ArrowRight" : getOppositeCommand("ArrowRight");
    case "backward":
      return team == conf.RED_TEAM ? "ArrowLeft" : getOppositeCommand("ArrowLeft");
    case "right":
      return team == conf.RED_TEAM ? "ArrowDown" : getOppositeCommand("ArrowDown");
    case "left":
      return team == conf.RED_TEAM ? "ArrowUp" : getOppositeCommand("ArrowUp");
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

function computePlayerVelocity(playerId, lastData, currentData) {
  if(lastData && lastData.players[playerId] && lastData.players[playerId].position &&
    currentData && currentData.players[playerId] && currentData.players[playerId].position) {
    var lastPlayerPosition = lastData.players[playerId].position;
    var curPlayerPosition = currentData.players[playerId].position;
    return vec.div(vec.sub(curPlayerPosition, lastPlayerPosition), currentData.tick - lastData.tick);
  }
  return playerVelocity = { x: 0, y: 0 };
}

function getBotRelativeGameEnv(lastData, currentData, botName) {
  var localPlayer = Object.values(currentData.players).find((player) => player.name == botName);
  if(!localPlayer || !localPlayer.position) {
    return null;
  }

  var botVelocity = computePlayerVelocity(localPlayer.id, lastData, currentData);

  var ballVelocity;
  if(lastData) {
    ballVelocity = vec.div(vec.sub(currentData.ball, lastData.ball), currentData.tick - lastData.tick);
  }
  else {
    ballVelocity = { x: 0, y: 0 };
  }

  var relativeEnv = {
    tick: currentData.tick,
    bot: {
      id: localPlayer.id,
      team: localPlayer.team,
      position: localPlayer.position,
      velocity: botVelocity
    },
    score: {
      ownTeam: localPlayer.team == conf.RED_TEAM ? currentData.scores.red : currentData.scores.blue,
      opponentTeam: localPlayer.team == conf.RED_TEAM ? currentData.scores.blue : currentData.scores.red,
      scoreLimit: currentData.scores.scoreLimit,
      time: currentData.scores.time,
      timeLimit: currentData.scores.timeLimit
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

    if(!player.position || player.team == conf.SPECTATORS) {
      return;
    }

    var playerVelocity = computePlayerVelocity(player.id, lastData, currentData);

    var relativePlayerInfo = {
      id: player.id,
      position: vec.sub(player.position, localPlayer.position),
      velocity: playerVelocity
    };

    (player.team == localPlayer.team ? relativeEnv.teammates : relativeEnv.opponents).push(relativePlayerInfo);
  });

  if(localPlayer.team == conf.BLUE_TEAM) {
    vec.transformVectors(relativeEnv, (vector) => {
      vector.x *= -1;
      vector.y *= -1;
    });
  }
  return relativeEnv;
}

module.exports = { applyAction, resetAllKeysExceptFor, getBotRelativeGameEnv }
