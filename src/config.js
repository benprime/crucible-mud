export default {
  MSG_COLOR: 'darkcyan',
  DMG_COLOR: 'firebrick',
  NOTICE_COLOR: 'yellow',
  TAUNT_COLOR: 'gold',

  THROW_EXCEPTIONS: true,
  COMBAT_INTERVAL: 500, // how often combat logic is run
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
