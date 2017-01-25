'use strict';

const globals = require('./globals');

// Base round will be 4000 millseconds.
// An average dexterity character, with an "average" weapon will attack every 4 seconds.


// mob checks will be hit every 500 millseconds? to check if they should be attacking again...

// seems hacky, dunno if I should be doing this... but save current mobs on the socketio room objects.
// if server crashes, or is stopped, mobs will disappear and be reinitialized... but that's fine.
// this allows for the update loop to just spin through existing rooms in memory, and not have to hit mongo
// for each combat frame. Not that we need it, but we could run the combat at 30fps.

// spawn checks have to hit mongo... they can run at a much slower framerate (every 10 seconds or something).
const MSG_COLOR = 'darkcyan';
const DMG_COLOR = 'firebrick';

// TODO: move these all into prototype functions of an actor base class
function readyToAttack(obj, now) {
  return obj.attackInterval && (!obj.lastAttack || obj.lastAttack + obj.attackInterval <= now);
}

function readyToTaunt(obj, now) {
  return obj.tauntInterval && (!obj.lastTaunt || obj.lastTaunt + obj.tauntInterval <= now);
}

function readyToIdle(obj, now) {
  return obj.idleInterval && (!obj.lastIdle || obj.lastIdle + obj.idleInterval <= now);
}

function attackRoll(obj) {
  // just return 0 or 1 for now
  return getRandomNumber(0, 2);
}

// max is not inclusive
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (Math.ceil(min) - Math.floor(max))) + min;
}

module.exports = function (io) {
  setInterval(() => {
    // getting "now" only once per iteration, so timestamps all match
    // todo: this may aggrevate (and snowball) peformance problems.... (if it falls behind heavily)
    const now = Date.now();
    // check all players...
    for (const socketId in io.sockets.connected) {
      // if socket is a logged in user
      const username = globals.USERNAMES[socketId];
      if (username) {
        const socket = io.sockets.connected[socketId];
        // if socket is in combat
        if (readyToAttack(socket, now)) {
          socket.lastAttack = now;

          // todo: someday this logic will need a target message when there is PVP
          let actorMessage = '';
          let roomMessage = '';
          if (attackRoll(socket)) {
            actorMessage = `<span class="${DMG_COLOR}">You hit ${socket.attackTarget}${' for 0 damage!</span>'.format(socket.attackTarget)}`;
            roomMessage = `<span class="${DMG_COLOR}${'">The {0} hits {1} for 0 damage!</span>'.format(username, socket.attackTarget)}`;
          } else {
            actorMessage = `<span class="${MSG_COLOR}${'">You swing at the {0} but miss!</span>'.format(socket.attackTarget)}`;
            roomMessage = `<span class="${MSG_COLOR}${'">{0} swings at the {1} but misses!</span>'.format(username, socket.attackTarget)}`;
          }


          socket.emit('output', { message: actorMessage });
          socket.broadcast.to(socket.room._id).emit('output', { message: roomMessage });
        }

        // console.log(username);
        // console.log(socket.attackInterval);
        // console.log(socket.lastAttack);
        // console.log('-------------------------');
      }
    }

    // check all mobs!
    // todo: probably just grab all the mobs that are currently in combat (right now just grabbing all of them)

    // foreach room
    for (const roomId in globals.MOBS) {
      // foreach mob
      for (const i in globals.MOBS[roomId]) {
        const mob = globals.MOBS[roomId][i];


        // TODO: right now the mobs are attacking on timer, regardless of target, or whether anyone is in the room.
        // need to check room for players... then attack random one... or perhaps one not attacked?
        if (readyToAttack(mob, now)) {
          mob.lastAttack = now;

          // TODO: THIS IS BROKEN
          // need to save attack target in the mobs attack.... and perhaps save username or socket id so we know who
          // to send a message to...
          let message = '';
          if (attackRoll(mob)) {
            message = `<span class="${DMG_COLOR}${'">The {0} hits you for 0 damage!</span>'.format(mob.displayName)}`;
          } else {
            message = `<span class="${MSG_COLOR}${'">The {0} swings at you but misses!</span>'.format(mob.displayName)}`;
          }

          io.to(roomId).emit('output', { message });
        }

        // todo: mobs should only taunt when attacking... need to add attackTarget logic to mobs
        // if (mob.attackTarget && readyToTaunt(mob, now)) {
        if (readyToTaunt(mob, now)) {
          const tauntIndex = getRandomNumber(0, mob.taunts.length);
          let taunt = mob.taunts[tauntIndex];
          taunt = taunt.format(mob.displayName);
          mob.lastTaunt = now;

          // socket.emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + taunt + "</span>" });
          // socket.broadcast.to(socket.room._id).emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + taunt + "</span>" });
        }

        /*
        if (readyToIdle(mob, now)) {
          let idleIndex = getRandomNumber(0, mob.idleActions.length);
          let idleAction = mob.idleActions[idleIndex];
          mob.lastIdle = now;
          socket.emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + idleAction + "</span>" });
          socket.broadcast.to(socket.room._id).emit("output", { message: "<span class=\"" + MSG_COLOR + "\">" + idleAction + "</span>" });
        }
        */
      }
    }
  }, 500);

  return {
    Attack(socket, targetName) {
      console.log(`Trying to attack the: ${targetName}`);
        // autocomplete name
      const resolvedName = globals.ResolveName(socket, targetName);
      console.log(`Auto completed name: ${resolvedName}`);

      const mobInRoom = globals.MOBS[socket.room._id] || [];
      const target = mobInRoom.find(mob => mob.displayName === resolvedName);
      console.log(`mobInRoom: ${JSON.stringify(mobInRoom)}`);
      console.log(`target: ${target}`);

      if (!target) {
        // socket.emit("output", { message: "You don't see that here!" });
        return;
      }

      /*
      TODO: YOU CAN'T ATTACK PLAYERS UNTIL THERE IS A CHARACTER OBJECT BEING STORED SOMEWHERE FOR THEM
      if (!target) {
        // todo: this needs to be able to find a "character object..."
        let targetUserName = UsersInRoom(socket).find(function(user) {
          return user === targetName;
        });
      }
      */

      const username = globals.USERNAMES[socket.id];

      socket.emit('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      socket.broadcast.to(socket.room._id).emit('output', { message: `${username} moves to attack ${resolvedName}!` });
      socket.attackInterval = 1500;
      socket.attackTarget = resolvedName;
    },

    Break(socket) {
      socket.attackInterval = undefined;
      socket.lastAttack = undefined;
      socket.attackTarget = undefined;
      const username = globals.USERNAMES[socket.id];

      // todo: Probably save attack target id, make sure we're continually attacking the same mob instance.
      socket.broadcast.to(socket.room._id).emit('output', { message: `${username} breaks off his attack.` });
      socket.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
    },
  };
};
