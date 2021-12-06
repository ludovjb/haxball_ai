const { createBot, sendMessageToBot, sendMessageToAllBots } = require('./server_functions.js');

async function onGameTick(data, server) {
    sendMessageToAllBots(server.bots, "onGameTick", data);
};

async function onPlayerJoin(data, server) {
  console.log(data + " has joined the room");
};

async function onPlayerLeave(data, server) {
  if(data.botId) {
    if(data.botId in server.bots) {
      delete server.bots[data.botId];
      console.log("The bot id "+data.botId+" has left the room");
      createBot(server);
    }
    else {
      console.error("The bot id "+data.botId+" doesn't exist in the server");
    }
  }
  else {
    console.log(data + " has left the room");
  }
};

async function onPositionsReset(data, server) {
  sendMessageToAllBots(server.bots, "onPositionsReset", {});
};

async function onGameStart(data, server) {
  sendMessageToAllBots(server.bots, "onGameStart", {});
};

async function onBotAuthentification(data, server) {
  if(!server.bots[data.botId]) {
    console.error("The bot id "+data.botId+" doesn't exist in the server");
    return;
  }
  sendMessageToBot(server.bots[data.botId], "onBotAuthentification", data);
};

module.exports = { onGameTick, onPlayerJoin, onPlayerLeave, onPositionsReset, onGameStart, onBotAuthentification };
