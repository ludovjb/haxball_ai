const { action, resetAllKeysExceptFor } = require('./bot_functions.js')

async function onGameTick(data, bot, page) {
  //await action(2, message.direction, page);
  var localPlayer = data.players.find((player) => player.name == bot.name);
  if(localPlayer.position == null) {
    return;
  }

  if(data.ball.x == 0.0 && data.ball.y == 0.0) {
    await resetAllKeysExceptFor(page);
  }

  ballX = (data.ball.x - localPlayer.position.x);
  ballY = (data.ball.y - localPlayer.position.y);
  if(localPlayer.team == 2) {
    ballX *= -1;
    ballY *= -1;
  }

  let distanceWithBall = Math.sqrt(Math.pow(ballX, 2)+Math.pow(ballY, 2));
  if(distanceWithBall < 25.5) {
    await action(localPlayer.team, "kick", page);
  }

  if(ballX >= 0 && ballY >= 0) {
    await action(localPlayer.team, "forward-right", page);
  }
  else if(ballX <= 0 && ballY >= 0) {
    await action(localPlayer.team, "backward-right", page);
  }
  else if(ballX >= 0 && ballY <= 0) {
    await action(localPlayer.team, "forward-left", page);
  }
  else if(ballX <= 0 && ballY <= 0) {
    await action(localPlayer.team, "backward-left", page);
  }
}

async function onPlayerChat(data, bot, page) {
  await resetAllKeysExceptFor(page);
}

module.exports = { onGameTick, onPlayerChat };
