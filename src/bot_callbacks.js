const { applyAction, resetAllKeysExceptFor, getBotRelativeGameEnv } = require('./bot_functions.js')
const { action } = require('./simple_ai.js');

var lastTickData = null;

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
    lastTickData = null;
    return; // the bot is not in the game
  }
  lastTickData = data;

  var actionName = action(environment);
  applyAction(environment.bot.team, actionName, page);
}

async function onPositionsReset(data, bot, page) {
  lastTickData = null;
  await resetAllKeysExceptFor(page);
}

module.exports = { onGameTick, onPositionsReset };
