import * as vec from "../src/vectors.js";

export function action(env) {
  let distanceWithBall = vec.normL2(env.ball.position);
  if (distanceWithBall < 25.5) {
    return "kick";
  }

  var angle = vec.angle(env.ball.position);

  if (approxEquals(angle, 0)) {
    return "forward";
  } else if (approxEquals(angle, 45)) {
    return "forward-left";
  } else if (approxEquals(angle, 90)) {
    return "left";
  } else if (approxEquals(angle, 135)) {
    return "backward-left";
  } else if (approxEquals(Math.abs(angle), 180)) {
    return "backward";
  } else if (approxEquals(angle, -135)) {
    return "backward-right";
  } else if (approxEquals(angle, -90)) {
    return "right";
  } /*if(approxEquals(angle, -45))*/ else {
    return "forward-right";
  }
}

function approxEquals(v1, v2) {
  return Math.abs(v1 - v2) <= 22.5;
}
