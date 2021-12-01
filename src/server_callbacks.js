async function onGameTick(data, bots) {
    sendMessageToBots(bots, "onGameTick", data);
};

async function onPlayerChat(data, bots) {
  console.log(data);

};

async function onPlayerJoin(data, bots) {
  console.log(data + " has joined the server");
};

async function sendMessageToBots(bots, callbackName, data) {
  bots.forEach(bot => bot.send({ callback: callbackName, data: data }));
}

module.exports = { onGameTick, onPlayerChat, onPlayerJoin };
