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

function normL2(vec) {
  return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
}

function angle(vec1, vec2) {
    var rad = Math.atan2(vec2.y,vec2.x) - Math.atan2(vec1.y,vec1.x);
    var deg = rad*(180/Math.PI);
    return deg;
}

function transformVectors(object, operation) {
  if(typeof object === 'object') {
    if("x" in object && "y" in object && Object.keys(object).length == 2) {
      object = operation(object);
    }
    else {
      Object.keys(object).forEach((key) => {
        transformVectors(object[key], operation);
      });
    }
  }
  else if(Array.isArray(object)) {
    object.forEach((arrayObject) => {
      transformVectors(arrayObject, operation);
    });
  }
}

module.exports = { add, sub, div, normL2, angle, transformVectors };
