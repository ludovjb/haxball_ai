async function onGameTick(data, bots) {
    sendMessageToBots(bots, "onGameTick", data);
};

async function onPlayerJoin(data, bots) {
  console.log(data + " has joined the server");
};

async function onPositionsReset(data, bots) {
  sendMessageToBots(bots, "onPositionsReset", {});
};

async function onGameStart(data, bots) {
  sendMessageToBots(bots, "onGameStart", {});
};

async function sendMessageToBots(bots, callbackName, data) {
  bots.forEach(bot => bot.send({ callback: callbackName, data: data }));
}

module.exports = { onGameTick, onPlayerJoin, onPositionsReset, onGameStart };
