import Room from '../models/room';
import config from '../config';

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
  const now = Date.now();
  processPlayerCombatActions(now);
  processMobCombatActions(now);
};

export default {
  processPlayerCombatActions,
  processMobCombatActions,
  combatFrame,
};

setInterval(combatFrame, config.COMBAT_INTERVAL);
