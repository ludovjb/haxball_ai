const conf = require('./config.js');
const { applyAction, resetAllKeysExceptFor, getBotRelativeGameEnv } = require('./bot_functions.js')

var lastTickData = null;
var actionFunction = null;
var delayBeforePlay = conf.MAX_DELAY_BEFORE_PLAY;

async function onGameTick(data, bot, page) {
  if(!lastTickData || data.tick - lastTickData.tick > 1) {
    await resetAllKeysExceptFor(page);
    lastTickData = data;
    return;
  }

  if(data.tick <= lastTickData.tick) {
    console.error("Late data tick for "+bot.name+" : "+data.tick +" <= "+ lastTickData.tick);
    return;
  }

  var environment = getBotRelativeGameEnv(lastTickData, data, bot.name);
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

  if(!actionFunction) {
    const { action } = require(bot.actionFile);
    actionFunction = action;
  }
  var actionName = actionFunction(environment);
  applyAction(environment.bot.team, actionName, page);
}

async function onPositionsReset(data, bot, page) {
  delayBeforePlay = conf.DELAY_BEFORE_PLAY;
}

async function onTeamGoal(data, bot, page) {
  delayBeforePlay = conf.MAX_DELAY_BEFORE_PLAY;
}

async function onGameStart(data, bot, page) {
  delayBeforePlay = conf.DELAY_BEFORE_PLAY;
  lastTickData = null;
}

module.exports = { onGameTick, onPositionsReset, onTeamGoal, onGameStart };
