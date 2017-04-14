'use strict';

const diceRegex = /^(\d+)d(\d+)(?:([\+-])(\d*))?$/i;

// max is not inclusive
function rollDie(sides) {
  const min = 1;
  const max = sides + 1;
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + min;
}

module.exports = {
  Roll(s) {
    let match = s.match(diceRegex);
    if (match) {
      const qty = ~~match[1];
      const sides = ~~match[2];

      let sum = 0;
      for (let i = 0; i < qty; i++) {
        sum += rollDie(sides);
      }

      if (match[3] && match[4]) {
        const modifier = match[4];
        if (match[3] == '+') {
          sum += modifier;
        } else {
          sum -= modifier;
        }
      }

      console.log("Rolled: ", sum);
      return sum;
    }
    throw "Invalid roll format: " + s;
  }
};