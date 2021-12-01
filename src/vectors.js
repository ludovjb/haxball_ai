function add(vec1, vec2) {
  return {
    x: vec1.x + vec2.x,
    y: vec1.y + vec2.y
   }
}

function sub(vec1, vec2) {
  return {
    x: vec1.x - vec2.x,
    y: vec1.y - vec2.y
   }
}

function div(vec, denominator) {
  return {
    x: vec.x / denominator,
    y: vec.y / denominator
   }
}

function reverse(vec, axeX = -1, axeY = -1) {
  return {
    x: vec.x * axeX,
    y: vec.y * axeY
   }
}

function normL2(vec) {
  return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
}

module.exports = { add, sub, div, reverse, l2norm };
