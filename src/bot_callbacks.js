import * as conf from "./config.js";
import {
  refreshActionFunction,
  applyAction,
  resetAllKeysExceptFor,
  getBotRelativeGameEnv,
} from "./bot_functions.js";

var dataHistory = {};
var delayBeforePlay = conf.MAX_DELAY_BEFORE_PLAY;

export async function onBotAuthentification(data, bot, _page) {
  bot.roomId = data.roomId;
  console.log(
    "The bot id " +
      bot.id +
      " is now authenticated as the bot roomId " +
      bot.roomId,
  );
}

export async function onGameTick(data, bot, page) {
  if (!bot.roomId || data.gameEnded) {
    dataHistory = {};
    await resetAllKeysExceptFor(page);
    return;
  }

  dataHistory[data.tick] = data;
  if (!(data.tick - 1 in dataHistory) || !(data.tick - 2 in dataHistory)) {
    return;
  } else {
    Object.keys(dataHistory)
      .filter((tick) => tick < data.tick - 2)
      .forEach((tick) => delete dataHistory[tick]);
  }

  var environment = getBotRelativeGameEnv(dataHistory, bot);
  if (!environment) {
    return; // the bot is not in the game
  }

  var lastData = dataHistory[data.tick - 1];
  var goalJustScored =
    lastData.scores.red != data.scores.red ||
    lastData.scores.blue != data.scores.blue;

  if (delayBeforePlay > 0) {
    await resetAllKeysExceptFor(page);
    if (delayBeforePlay < conf.MAX_DELAY_BEFORE_PLAY) {
      if (delayBeforePlay % 8 == 0) {
        applyAction(environment.bot.team, "kick", page);
      } else if (delayBeforePlay == 10) {
        applyAction(environment.bot.team, "right", page);
      } else if (delayBeforePlay == 20) {
        applyAction(environment.bot.team, "left", page);
      }
      delayBeforePlay--;
    }
    return;
  }

  if (goalJustScored) {
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

export async function onPositionsReset(_data, _bot, _page) {
  delayBeforePlay = conf.DELAY_BEFORE_PLAY;
}

export async function onGameStart(_data, _bot, _page) {
  delayBeforePlay = conf.DELAY_BEFORE_PLAY;
}

export async function onActionFileRefresh(data, bot, _page) {
  if (data.actionFile) {
    bot.actionFile = data.actionFile;
  }
  refreshActionFunction(bot);
}
