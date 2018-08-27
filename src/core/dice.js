/**
 * dice regex that matches format of "2d6+4"
 */
const diceRegex = /^(\d+)d(\d+)(?:([+-])(\d*))?$/i;

export default {
  /**
   * Generate a random number between a min and max.
   * @param {Number} min - Minimum of range.
   * @param {Number} max - Not inclusive.
   */
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + min;
  },

  /**
   * Roll a single die.
   * @param {Number} sides - Type of dice to roll. Inclusive.
   * @returns {Number} - Result of roll.
   */
  rollDie(sides) {
    const min = 1;
    const max = sides + 1;
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + min;
  },

  /**
   * Roll dice using dice notation string.
   * @param {String} diceString - Dice notation string. Example: "2d6+4"
   */
  roll(diceString) {
    let match = diceString.match(diceRegex);
    if (match) {
      const qty = ~~match[1];
      const sides = ~~match[2];

      let sum = 0;
      for (let i = 0; i < qty; i++) {
        sum += this.rollDie(sides);
      }

      if (match[3] && match[4]) {
        const modifier = match[4];
        if (match[3] === '+') {
          sum += modifier;
        } else {
          sum -= modifier;
        }
      }

      return sum;
    }
    throw `Invalid roll format: ${diceString}`;
  },
};
