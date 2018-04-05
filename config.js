'use strict';

module.exports = {
  MSG_COLOR: 'darkcyan',
  DMG_COLOR: 'firebrick',
  NOTICE_COLOR: 'yellow',
  TAUNT_COLOR: 'gold',




  COMBAT_INTERVAL: 500, // how often combat logic is run
  ROUND_DURATION: 4000, // how long a round is considered to be
  SPAWNER_INTERVAL: 500,
  DOOR_CLOSE_TIMER: 10000,

  // todo: remove this when login functionality exists
  STATES: {
    LOGIN_USERNAME: 0,
    LOGIN_PASSWORD: 1,
    MUD: 2,
  },
};
