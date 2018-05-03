'use strict';

const Room = require('../models/room');
const config = require('../../config');

module.exports = {
  processPlayerCombatActions(now) {
    // note: this only includes rooms a player is currently subscribed to
    var roomIds = Object.keys(global.io.sockets.adapter.rooms);

    for (const roomId of roomIds) {
      let room = Room.getById(roomId);
      if (room) {
        room.processPlayerCombatActions(now);
      }
    }
  },

  // loop through rooms that contain mobs...
  processMobCombatActions(now) {
    const roomsWithMobs = Object.values(Room.roomCache)
      .filter(r => Array.isArray(r.mobs) && r.mobs.length > 0);

    roomsWithMobs.forEach(function (room) {
      room.processMobCombatActions(now);
    });
  },

  combatFrame() {
    const now = Date.now();
    module.exports.processPlayerCombatActions(now);
    module.exports.processMobCombatActions(now);
  },
};

setInterval(module.exports.combatFrame, config.COMBAT_INTERVAL);
