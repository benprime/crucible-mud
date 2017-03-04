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
const COMBAT_INTERVAL = 500;


// TODO: move these all into prototype functions of an actor base class
function readyToAttack(obj, now) {
  // if the player hasn't attacked anything, they are never ready to attack
  /*
  if(!obj.attackTarget) {
    return false;
  }
  */
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
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + min;
}


module.exports = function(io) {

  // select MOB attack target... rename this (this will all get refactored into a model)
  function selectTarget(roomid, mob) {
    // if everyone has disconnected from a room (but mobs still there) the room will not be defined.
    const room = io.sockets.adapter.rooms[roomid];

    // if there is at least one player in the room
    if (room) {
      // todo: check if this player has left or died or whatever.
      if (!mob.attackTarget) {
        console.log("Finding mob attack target...");

        // select random player to attack
        const clients = room.sockets;
        const socketsInRoom = Object.keys(clients);
        const targetIndex = getRandomNumber(0, socketsInRoom.length);
        const socketId = socketsInRoom[targetIndex];
        console.log("target's socket id: " + socketId)

        // get player socket
        const socket = io.sockets.connected[socketId];

        //todo: I guess attack target can be the socketId? hrmm...
        mob.attackTarget = socket;
        const username = globals.USERNAMES[socketId];

        socket.broadcast.to(roomid).emit('output', { message: `The ${mob.displayName} moves to attack ${username}!` });
        socket.emit('output', { message: `The ${mob.displayName} moves to attack you!` });
        // todo: send to user socket as "moves to attack you" change the above to the emit to a socket broadcast.


        //console.log(targetIndex);
        //console.log(socketId);
      }
    }

    // this one will get only "true" as a value for the socket
    //console.log(io.sockets.adapter.rooms[roomid].sockets[socketId]);

    // this one will get all the attached data we've been setting
    //const socket = io.sockets.connected[socketId];

    // get the room object
  }

  function MobDamage(socket, mob, damage) {
    mob.hp -= damage;
    if (mob.hp <= 0) {
      io.to(socket.room._id).emit('output', { message: 'The creature collapses.' });
      socket.emit('output', { message: `You gain ${mob.xp} experience.` });

      const mobInRoom = globals.MOBS[socket.room._id] || [];
      let i = mobInRoom.indexOf(mob);
      globals.MOBS[socket.room._id].splice(i, 1);

      socket.attackTarget = null;
      socket.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });

      // loop through sockets in room... remove this mob from all other attack targets
      const room = io.sockets.adapter.rooms[socket.room._id];
      Object.keys(room.sockets).forEach((socketId) => {
        let otherSocket = io.sockets.connected[socketId];
        if(otherSocket.attackTarget === mob)
        {
          otherSocket.attackTarget = null;
          otherSocket.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
        }
      });


      // todo... this may require a refresh room...
    }
  }


  setInterval(() => {
    // leaving this here for a bit so I can check that this only gets setup once
    // and not per connection or something...


    // todo: check to make sure this is firing at a reasonable rate
    // console.log("combat frame");

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
          if (!socket.attackTarget) {
            continue;
          }
          socket.lastAttack = now;

          // todo: someday this logic will need a target message when there is PVP
          let actorMessage = '';
          let roomMessage = '';
          const playerDmg = 5;

          let attackResult = attackRoll(socket);

          if (attackResult) {
            actorMessage = `<span class="${DMG_COLOR}">You hit ${socket.attackTarget.displayName} for ${playerDmg} damage!</span>`;
            roomMessage = `<span class="${DMG_COLOR}">The ${username} hits ${socket.attackTarget.displayName} for ${playerDmg} damage!</span>`;
          } else {
            actorMessage = `<span class="${MSG_COLOR}">You swing at the ${socket.attackTarget.displayName} but miss!</span>`;
            roomMessage = `<span class="${MSG_COLOR}">${username} swings at the ${socket.attackTarget.displayName} but misses!</span>`;
          }

          socket.emit('output', { message: actorMessage });
          socket.broadcast.to(socket.room._id).emit('output', { message: roomMessage });

          if (attackResult && socket.attackTarget) {
            MobDamage(socket, socket.attackTarget, playerDmg);
          }
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
          console.log("mob ready to attack")
          selectTarget(roomId, mob);
          console.log("mob target:" + mob.attackTarget)
          mob.lastAttack = now;

          // TODO: THIS IS BROKEN
          // need to save attack target in the mobs attack.... and perhaps save username or socket id so we know who
          // to send a message to...
          const dmg = 0;


          let socket = mob.attackTarget;

          let playerMessage = '';
          let roomMessage = '';
          var playerName = globals.USERNAMES[socket.id];
          if (attackRoll(mob)) {
            playerMessage = `<span class="${DMG_COLOR}">${mob.displayName} hits you for ${dmg} damage!</span>`;
            roomMessage = `<span class="${DMG_COLOR}">The ${mob.displayName} hits ${playerName} for ${dmg} damage!</span>`;
          } else {
            playerMessage = `<span class="${MSG_COLOR}">The ${mob.displayName} swings at you, but misses!</span>`;
            roomMessage = `<span class="${MSG_COLOR}">The ${mob.displayName} swings at ${playerName}, but misses!</span>`;
          }

          // TODO: this will have to handle all damage and experience stuff...

          // todo: should not rely on target player's socket to inform other players of combat stuffs.
          // If the player disconnects, game should still inform players. Perhaps just loop through all sockets in room (like in actions.)
          socket.emit('output', { message: playerMessage });
          socket.broadcast.to(socket.room._id).emit('output', { message: roomMessage });

          //io.to(roomId).emit('output', { message });
        }

        // todo: mobs should only taunt when attacking... need to add attackTarget logic to mobs
        // if (mob.attackTarget && readyToTaunt(mob, now)) {
        if (readyToTaunt(mob, now)) {
          const tauntIndex = getRandomNumber(0, mob.taunts.length);
          let taunt = mob.taunts[tauntIndex];
          taunt = taunt.format(mob.displayName);
          mob.lastTaunt = now;
          io.to(roomId).emit("output", { message: taunt });

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
  }, COMBAT_INTERVAL);

  return {
    Attack(socket, targetName) {
      console.log(`Trying to attack the: ${targetName}`);
      // autocomplete name
      const mobInRoom = globals.MOBS[socket.room._id] || [];
      const mobNames = mobInRoom.map(mob => mob.displayName);
      const resolvedName = globals.ResolveName(socket, targetName, mobNames);
      
      console.log(`Auto completed name: ${resolvedName}`);

      const target = mobInRoom.find(mob => mob.displayName === resolvedName);
      //console.log(`mobInRoom: ${JSON.stringify(mobInRoom)}`);
      //console.log(`target: ${JSON.stringify(target)}`);

      if (!target) {
        socket.emit("output", { message: "You don't see that here!" });
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

      socket.attackTarget = target;

      const username = globals.USERNAMES[socket.id];

      socket.emit('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      socket.broadcast.to(socket.room._id).emit('output', { message: `${username} moves to attack ${resolvedName}!` });
      socket.attackInterval = 4000;
      //socket.attackTarget = resolvedName;
    },

    Break(socket) {
      if (socket.attackTarget) {
        socket.attackInterval = undefined;
        socket.lastAttack = undefined;
        socket.attackTarget = undefined;
        const username = globals.USERNAMES[socket.id];

        // todo: Probably save attack target id, make sure we're continually attacking the same mob instance.
        socket.broadcast.to(socket.room._id).emit('output', { message: `${username} breaks off his attack.` });
        socket.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
      }
    },

    // TODO: should this be "MobBreak", for consistency?
    MobDisengage(socket) {
      // about to leave a room, disengage any combat
      const mobList = globals.MOBS[socket.room._id];
      if (mobList) {
        mobList.forEach(function(mob) {
          //console.log("attacktarget", mob.attackTarget);
          //console.log("socket.userId", socket.id);
          if (mob.attackTarget === socket.id) {
            //console.log("attack broken off");
            mob.attackTarget = null;
          }
        });
      }
    }
  };
};
