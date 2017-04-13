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
    //console.log(socket.user);
    // if socket is a logged in user
    if (socket.user && socket.user.readyToAttack(now)) {
      console.log("player attacking!");
      roomManager.getRoomById(socket.user.roomId, function(room) {
        let mob = room.getMobById(socket.user.attackTarget);
        //if(!mob) socket.user.attackTarget = null;
        console.log("Attacking from room: ", socket.user.roomId);
        socket.user.attack(socket, mob, now);
      });
    }
  }

  // loop through rooms that contain mobs...
  roomManager.roomsWithMobs().forEach(function(room) {
    room.mobs.forEach(function(mob) {
      if (mob.readyToAttack(now)) {
        console.log("mob ready to attack");
        mob.selectTarget(room.id, mob);
        // todo: maybe have select target return if there is a valid target
        if(mob.attackTarget) {
          mob.attack(now);
        }
      }

      // todo: mobs should only taunt when attacking... need to add attackTarget logic to mobs
      // if (mob.attackTarget && readyToTaunt(mob, now)) {
      if (mob.readyToTaunt(now)) {
        const tauntIndex = global.getRandomNumber(0, mob.taunts.length);
        let taunt = mob.taunts[tauntIndex];
        taunt = taunt.format(mob.displayName);
        mob.lastTaunt = now;
        global.io.to(room.id).emit("output", { message: taunt });

        // socket.emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + taunt + "</span>" });
        // socket.broadcast.to(socket.room._id).emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + taunt + "</span>" });
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
