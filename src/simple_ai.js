const vec = require('./vectors.js');

function action(env) {
  let distanceWithBall = vec.normL2(env.ball.position);
  if(distanceWithBall < 25.5) {
    return "kick";
  }

  if(env.ball.position.x == -env.bot.position.x && env.ball.position.y == 0) {
    return "forward";
  }
  if(env.ball.position.x >= 0 && env.ball.position.y >= 0) {
    return "forward-right";
  }
  else if(env.ball.position.x <= 0 && env.ball.position.y >= 0) {
    return "backward-right";
  }
  else if(env.ball.position.x >= 0 && env.ball.position.y <= 0) {
    return "forward-left";
  }
  else if(env.ball.position.x <= 0 && env.ball.position.y <= 0) {
    return "backward-left";
  }

  return "none";
}

module.exports = { action };
