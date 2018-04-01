'use strict';

const Room = require('./models/room');
const config = require('./config');

function playerAttack(now) {
  // check all players...
  for (const socketId in global.io.sockets.connected) {
    const socket = global.io.sockets.connected[socketId];
    // if socket is a logged in user
    if (socket.user && socket.user.readyToAttack(now)) {
      const room = Room.getById(socket.user.roomId);
      let mob = room.getMobById(socket.user.attackTarget);
      //if(!mob) socket.user.attackTarget = null;
      socket.user.attack(socket, mob, now);
    }
  }
}

function mobAttack(now) {
  // loop through rooms that contain mobs...
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

      /*
      if (readyToIdle(mob, now)) {
        let idleIndex = socketUtil.getRandomNumber(0, mob.idleActions.length);
        let idleAction = mob.idleActions[idleIndex];
        mob.lastIdle = now;
        socket.emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + idleAction + "</span>" });
        socket.broadcast.to(socket.room._id).emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + idleAction + "</span>" });
      }
      */

    });
  });
}

function combatFrame() {
  const now = Date.now();
  playerAttack(now);
  mobAttack(now);
}

setInterval(combatFrame, config.COMBAT_INTERVAL);
module.exports = {};
