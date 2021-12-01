function action(env) {
  let distanceWithBall = Math.sqrt(Math.pow(env.ball.position.x, 2)+Math.pow(env.ball.position.y, 2));
  if(distanceWithBall < 25.5) {
    return "kick";
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
