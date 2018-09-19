export const globalErrorHandler = function (err) {
  const errorOut = err instanceof Error ? err.stack : err;
  console.log('--------------------------------------------');
  console.log(`AN ERROR OCCURED!\n${errorOut}`);
  console.log('--------------------------------------------');
};

export default {
  // base modules: system/core, map?
  // system commands don't use the system perhaps? Their parsers could call the functionality directly?
  modules: [
    'system',
    'item',
    //'combat',
  ],

  defaultCommand: 'who',

  MSG_COLOR: 'darkcyan',
  DMG_COLOR: 'firebrick',
  NOTICE_COLOR: 'yellow',
  TAUNT_COLOR: 'gold',

  GAME_INTERVAL: 250,
  COMBAT_INTERVAL: 250, // how often combat logic is run
  ROUND_DURATION: 4000, // how long a round is considered to be
  SPAWNER_INTERVAL: 500,
  DOOR_CLOSE_TIMER: 60 * 1000,
  OFFER_TIMEOUT: 60 * 1000,
  DEFAULT_ROOM_MOB_MAX: 4,
  DAY_LENGTH: 10 * 60 * 1000, // ten minutes
  BLEED_ROUNDS: 4,
  REGEN_ROUNDS: 4,
  TESTING_MODE: false,

  // todo: remove this when login functionality exists
  STATES: {
    LOGIN_USERNAME: 0,
    LOGIN_PASSWORD: 1,
    MUD: 2,
  },
};
