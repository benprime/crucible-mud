import Room from '../models/room';
import config, { globalErrorHandler } from '../config';

let lastRound = new Date();
let round = 0;

/**
 * Executes player combat logic for every room.
 * @param {Date} now - Execution time of this frame.
 */
const processPlayerCombatActions = function (now) {
  // note: this only includes rooms a player is currently subscribed to
  const roomIds = Object.keys(global.io.sockets.adapter.rooms);

  for (const roomId of roomIds) {
    let room = Room.getById(roomId);
    if (room) {
      room.processPlayerCombatActions(now);
    }
  }
};

const processEndOfRound = function (round) {
  // note: this only includes rooms a player is currently subscribed to
  const roomIds = Object.keys(global.io.sockets.adapter.rooms);

  for (const roomId of roomIds) {
    let room = Room.getById(roomId);
    if (room) {
      room.processEndOfRound(round);
    }
  }
};

/**
 * Executed mob combat logic for every room.
 * @param {Date} now 
 */
const processMobCombatActions = function (now) {
  const roomsWithMobs = Object.values(Room.roomCache)
    .filter(({ mobs }) => Array.isArray(mobs) && mobs.length > 0);

  roomsWithMobs.forEach(room => {
    room.processMobCombatActions(now);
  });
};

/**
 * Main entry point for all combat logic. Executed on interval.
 */
const combatFrame = function () {
  try {
    const now = Date.now();

    // round tracker
    if (now - lastRound >= config.ROUND_DURATION) {
      processEndOfRound(round);
      lastRound = now;
      round++;
      round = round % 100;
    }

    processPlayerCombatActions(now);
    processMobCombatActions(now);
  } catch (e) {
    globalErrorHandler(e);
  }
};

export default {
  processPlayerCombatActions,
  processMobCombatActions,
  combatFrame,
};

setInterval(combatFrame, config.COMBAT_INTERVAL);
