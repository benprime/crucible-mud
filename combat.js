'use strict';

const Room = require('./models/room');
const config = require('./config');

// TODO: It may make more sense to have the room process it's own attacks and loop
// through the room and call a room-specific processPlayerCombatActions and processMobCombatActions.
// This way, we can have room states affect combat.

function processPlayerCombatActions(now) {

  // get all rooms with subscribers
  // check all players...

  // this should only include rooms a player is currently subscribed to
  var roomIds = Object.keys(global.io.sockets.adapter.rooms);

  for (const roomId of roomIds) {
    let room = Room.getById(roomId);
    if(room) {
      room.processPlayerCombatActions(now);
    }
  }
}

function processMobCombatActions(now) {
  // loop through rooms that contain mobs...
  // TODO: when mobs are are added or removed from rooms, maintain a list of rooms with
  // mobs so that we don't have to build this filter every iteration. (might not make much performance difference)
  const roomsWithMobs = Object.values(Room.roomCache).filter(r => r.mobs.length > 0);
  roomsWithMobs.forEach(function (room) {
    room.processMobCombatActions(now);
  });
}

function combatFrame() {
  const now = Date.now();
  processPlayerCombatActions(now);
  processMobCombatActions(now);
}

setInterval(combatFrame, config.COMBAT_INTERVAL);
module.exports = {};
