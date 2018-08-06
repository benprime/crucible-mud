import Room from '../models/room';
import config from '../config';

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

// loop through rooms that contain mobs...
const processMobCombatActions = function (now) {
  const roomsWithMobs = Object.values(Room.roomCache)
    .filter(({ mobs }) => Array.isArray(mobs) && mobs.length > 0);

  roomsWithMobs.forEach(room => {
    room.processMobCombatActions(now);
  });
};

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
