export const globalErrorHandler = function (err) {
  const errorOut = err instanceof Error ? err.stack : err;
  console.log('--------------------------------------------');
  console.log(`AN ERROR OCCURED!\n${errorOut}`);
  console.log('--------------------------------------------');
};

export default {

  NODE_PORT: process.env.NODE_PORT || 3000,
  MONGO_HOST: process.env.MONGO_DB || 'localhost',
  MONGO_DB: process.env.MONGO_DB || 'mud',
  MONGO_PORT: process.env.MONGO_PORT || 27017,
  APP_URL: process.env.APP_URL || 'http://localhost:3001',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'SUPER-SECRET',

  BCRYPT_SALT_ROUNDS: 10,

  modules: [
    'move',
    'admin',
    'basic',
    'character',
    'system',
    'item',
    'combat',
    'communication',
    'door',
    'party',
    'shop',
    'stealth',
    'special',
    'worldCrafting',
  ],

  defaultCommand: 'say',

  // presentation config
  MSG_COLOR: 'darkcyan',
  DMG_COLOR: 'firebrick',
  NOTICE_COLOR: 'yellow',
  TAUNT_COLOR: 'gold',

  // game config
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
};
