const { fork } = require('child_process');

function checkPasswordValue(password) {
  if(password.length > 30) {
    console.error("Given password is too long (maxlength = 30). Default password ('"+conf.DEFAULT_PASSWORD+"') is set.");
    return conf.DEFAULT_PASSWORD;
  }
  return password;
}

function checkAIActionFile(fileName) {
  const relativeFileName = "../"+fileName;
  try {
    const { action } = require(relativeFileName);
  } catch (error) {
    console.error("An error has occured with the following action file : "+relativeFileName);
    console.error(error);
    process.exit(1);
  }
  return relativeFileName;
}

var counterBots = 0;
function createBot(server) {
  var botId = ++counterBots;
  const child = fork("./src/bot.js", [botId, server.roomLink, server.admin, server.password]);
  server.bots[botId] = child;
  if(server.verbose) {
    console.log("Bot id " + botId + " has been created and forked");
  }
  return botId;
}

async function sendMessageToAllBots(bots, callbackName, data) {
  Object.values(bots).forEach(async bot => bot.send({ callback: callbackName, data: data }));
}

async function sendMessageToBot(bot, callbackName, data) {
  bot.send({ callback: callbackName, data: data });
}

module.exports = { checkPasswordValue, checkAIActionFile, createBot, sendMessageToAllBots, sendMessageToBot };
