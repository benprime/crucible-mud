'use strict';

//this is for items and mobs (since those are cataloged objects)

const roomManager = require('../roomManager');
const mobData = require('../data/mobData');
const Mob = require('../models/mob');

const itemData = require('../data/itemData');
const Item = require('../models/item');

module.exports = {
  name: 'destroy',
  admin: true,

  patterns: [
    /^destroy\s+(mob)\s+(\w+)$/i,
    /^destroy\s+(item)\s+(\w+)$/i,
    /^destroy\s+/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      // todo: print help
      socket.emit('output', { message: 'Invalid destroy usage.' });
      return;
    }
    let typeName = match[1];
    let objectID = match[2];
    console.log("Attempting to destroy: ", typeName, ": ", objectID);
    module.exports.execute(socket, typeName, objectID);
  },

  execute(socket, type, id) {

    if (type == 'mob') {
      //look for mob in user's current room
      roomManager.getRoomById(socket.user.roomId, (room) => {
        //locate mob
        const mob = room.mobs.find(mob => mob.id = id);
        if (!mob) {
          socket.emit('output', { message: 'Unknown mob ID.' });
          return;
        }

        // delete mob
        const mobIndex = room.mobs.indexOf(mob);
        room.mobs.splice(mobIndex, 1);

        //clean up after vortex caused by mob removal
        socket.emit('output', { message: 'Mob successfully destroyed.' });

        //announce mob disappearance to any onlookers
        socket.broadcast.to(room.id).emit('output', { message: `${mob.displayName} erased from existence!` });
      });
    } 
    else if(type == 'item') {
      //look for mob in user's current room
      roomManager.getRoomById(socket.user.roomId, (room) => {
        //locate item
        const item = room.items.find(item => item.id = id);
        if (!item) {
          socket.emit('output', { message: 'Unknown item ID.' });
          return;
        }

        // delete item
        const itemIndex = room.items.indexOf(item);
        room.items.splice(itemIndex, 1);

        //clean up after vortex caused by item removal
        socket.emit('output', { message: 'Item successfully destroyed.' });

        //announce item disappearance to any onlookers
        socket.broadcast.to(room.id).emit('output', { message: `${item.displayName} erased from existence!` });

      // todo: determine if we want to hide when an admin creates and item      
      //socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} waves his hand and a ${createType.displayName} appears!` });
    });
    }
  },

  help() { },
};
