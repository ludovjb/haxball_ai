const { applyAction, resetAllKeysExceptFor, getBotRelativeGameEnv } = require('./bot_functions.js')
const { action } = require('./simple_ai.js');

var lastTickData = null;

async function onGameTick(data, bot, page) {
  if(!lastTickData || data.tickNumber - lastTickData.tickNumber > 1) {
    await resetAllKeysExceptFor(page);
    lastTickData = data;
    return;
  }

  if(data.tickNumber <= lastTickData.tickNumber) {
    console.error("Late data tick for "+bot.name+" : "+data.tickNumber +" <= "+ lastTickData.tickNumber);
    return;
  }

  var environment = getBotRelativeGameEnv(lastTickData, data, bot.name);
  lastTickData = data;

  var actionName = action(environment);
  applyAction(environment.bot.team, actionName, page);
}

async function onPlayerChat(data, bot, page) {
  await resetAllKeysExceptFor(page);
}

module.exports = { onGameTick, onPlayerChat };
