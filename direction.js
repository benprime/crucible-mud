'use strict';

const Room = require('./models/room');


module.exports = {



  LongToShort(dir) {
    switch (dir) {
      case 'north':
        return 'n';
      case 'northeast':
        return 'ne';
      case 'east':
        return 'e';
      case 'southeast':
        return 'se';
      case 'south':
        return 's';
      case 'southwest':
        return 'sw';
      case 'west':
        return 'w';
      case 'northwest':
        return 'nw';
      case 'up':
        return 'u';
      case 'down':
        return 'd';
      default:
        return dir;
    }
  },



  // this is for database inputs and such
  ValidDirection(dir) {
    const validDirections = Room.schema.path('dir').enumValues;
    return validDirections.indexOf(dir) >= 0;
  },

  // this is for user input
  ValidDirectionInput(dir) {
    switch (dir) {
      case 'n':
      case 'north':
      case 'ne':
      case 'northeast':
      case 'e':
      case 'east':
      case 'se':
      case 'southeast':
      case 's':
      case 'south':
      case 'sw':
      case 'southwest':
      case 'w':
      case 'west':
      case 'nw':
      case 'northwest':
      case 'u':
      case 'up':
      case 'd':
      case 'down':
        return true;
      default:
        return false;
    }
  },

  // used for building exits
  },


};
