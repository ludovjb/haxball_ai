const conf = require('./config.js');
const { refreshActionFunction, applyAction, resetAllKeysExceptFor, getBotRelativeGameEnv } = require('./bot_functions.js')

var lastTickData = null;
var delayBeforePlay = conf.MAX_DELAY_BEFORE_PLAY;

async function onBotAuthentification(data, bot, page) {
  bot.roomId = data.roomId;
  console.log("The bot id "+bot.id+" is now authentificate as the bot roomId "+bot.roomId);
}

async function onGameTick(data, bot, page) {
  if(!bot.roomId) {
    return;
  }

  if(!lastTickData || data.tick - lastTickData.tick > 1 || data.gameEnded) {
    await resetAllKeysExceptFor(page);
    lastTickData = data;
    return;
  }

  var goalJustScored = lastTickData.scores.red != data.scores.red || lastTickData.scores.blue != data.scores.blue;

  var environment = getBotRelativeGameEnv(lastTickData, data, bot);
  if(!environment) {
    return; // the bot is not in the game
  }
  lastTickData = data;

  if(delayBeforePlay > 0) {
    await resetAllKeysExceptFor(page);
    if(delayBeforePlay < conf.MAX_DELAY_BEFORE_PLAY) {
      if(delayBeforePlay % 8 == 0) {
        applyAction(environment.bot.team, "kick", page);
      }
      else if(delayBeforePlay == 10) {
        applyAction(environment.bot.team, "right", page);
      }
      else if(delayBeforePlay == 20) {
        applyAction(environment.bot.team, "left", page);
      }
      delayBeforePlay--;
    }
    return;
  }

  if(goalJustScored) {
    delayBeforePlay = conf.MAX_DELAY_BEFORE_PLAY;
  }

  var actionName;
  try {
    actionName = bot.actionFunction ? bot.actionFunction(environment) : "none";
  } catch (error) {
    console.error(error);
    actionName = "none";
  }
  applyAction(environment.bot.team, actionName, page);
}

async function onPositionsReset(data, bot, page) {
  delayBeforePlay = conf.DELAY_BEFORE_PLAY;
}

async function onGameStart(data, bot, page) {
  delayBeforePlay = conf.DELAY_BEFORE_PLAY;
  lastTickData = null;
}

async function onActionFileRefresh(data, bot, page) {
  if(data.actionFile) {
    bot.actionFile = data.actionFile;
  }
  refreshActionFunction(bot);
}

module.exports = { onBotAuthentification, onGameTick, onPositionsReset, onGameStart, onActionFileRefresh };
