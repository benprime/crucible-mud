'use strict';

const roomManager = require('../roomManager');
const mobData = require('../data/mobData');
const Mob = require('../models/mob');

const itemData = require('../data/itemData');
const Item = require('../models/item');

module.exports = {
  name: 'spawn',
  admin: true,

  patterns: [
    /^spawn\s+(mob)\s+(\w+)$/i,
    /^spawn\s+(item)\s+(\w+)$/i,
    /^spawn\s+/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      // todo: print help
      socket.emit('output', { message: 'Invalid spawn usage.' });
      return;
    }
    let typeName = match[1];
    let itemTypeName = match[2];
    console.log("Attempting to spawn: ", typeName, ": ", itemTypeName);
    module.exports.execute(socket, typeName, itemTypeName);
  },

  execute(socket, type, name) {

    if (type == 'mob') {
      const createType = mobData.catalog.find(mob => mob.name.toLowerCase() === name.toLowerCase());

      if (!createType) {
        socket.emit('output', { message: 'Unknown mob type.' });
        return;
      }

      // clone the create type and give it an id
      let mob = new Mob(createType);

      roomManager.getRoomById(socket.user.roomId, (room) => {
        room.mobs.push(mob);
        socket.emit('output', { message: 'Summoning successful.' });
        socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} waves his hand and a ${createType.displayName} appears!` });
      });
    } else if(type == 'item') {
      const createType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase());

      if (!createType) {
        socket.emit('output', { message: 'Unknown item type.' });
        return;
      }

      // clone the create type and give it an id
      let item = new Item(createType);

      socket.user.inventory.push(item);
      socket.user.save();
      socket.emit('output', { message: 'Item created.' });

      // todo: determine if we want to hide when an admin creates and item      
      //socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} waves his hand and a ${createType.displayName} appears!` });
    }
  },

  help() { },
};
