'use strict';

const roomManager = require('./roomManager');

// Base round will be 4000 millseconds.
// An average dexterity character, with an "average" weapon will attack every 4 seconds.


// mob checks will be hit every 500 millseconds? to check if they should be attacking again...



setInterval(() => {

  const now = Date.now();

  // check all players...
  for (const socketId in global.io.sockets.connected) {
    const socket = global.io.sockets.connected[socketId];
    // if socket is a logged in user
    if (socket.user && socket.user.readyToAttack(now)) {
      console.log('player attacking!');
      const room = roomManager.getRoomById(socket.user.roomId);
      let mob = room.getMobById(socket.user.attackTarget);
      //if(!mob) socket.user.attackTarget = null;
      console.log('Attacking from room: ', socket.user.roomId);
      socket.user.attack(socket, mob, now);
    }
  }

  // loop through rooms that contain mobs...
  roomManager.roomsWithMobs().forEach(function (room) {
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
        let idleIndex = global.getRandomNumber(0, mob.idleActions.length);
        let idleAction = mob.idleActions[idleIndex];
        mob.lastIdle = now;
        socket.emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + idleAction + "</span>" });
        socket.broadcast.to(socket.room._id).emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + idleAction + "</span>" });
      }
      */

    });
  });
}, global.COMBAT_INTERVAL);

module.exports = {};
