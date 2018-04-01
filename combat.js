'use strict';

const Room = require('./models/room');
const config = require('./config');

// TODO: It may make more sense to have the room process it's own attacks and loop
// through the room and call a room-specific processPlayerAttacks and processMobAttacks.
// This way, we can have room states affect combat.

function processPlayerAttacks(now) {
  // check all players...
  for (const socketId in global.io.sockets.connected) {
    const socket = global.io.sockets.connected[socketId];
    // if socket is a logged in user
    if (socket.user && socket.user.readyToAttack(now)) {
      const room = Room.getById(socket.user.roomId);
      if(!socket.user.attackTarget) continue;
      let mob = room.getMobById(socket.user.attackTarget);
      socket.user.attack(socket, mob, now);
    }
  }
}

function processMobAttacks(now) {
  // loop through rooms that contain mobs...
  // TODO: when mobs are are added or removed from rooms, maintain a list of rooms with
  // mobs so that we don't have to build this filter every iteration. (might not make much performance difference)
  const roomsWithMobs = Object.values(Room.roomCache).filter(r => r.mobs.length > 0);
  roomsWithMobs.forEach(function (room) {
    room.mobs.forEach(function (mob) {
      if (mob.readyToAttack(now)) {
        if (!mob.attack(now)) {
          mob.selectTarget(room.id, mob);
        }
      }

      if (mob.readyToTaunt(now)) {
        mob.taunt(now);
      }
    });
  });
}

function combatFrame() {
  const now = Date.now();
  processPlayerAttacks(now);
  processMobAttacks(now);
}

setInterval(combatFrame, config.COMBAT_INTERVAL);
module.exports = {};
