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
    /^spawn\s+(key)\s+(\w+)$/i,
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

      const room = roomManager.getRoomById(socket.user.roomId);
      // clone the create type and give it an id
      let mob = new Mob(createType, room.id);

      room.mobs.push(mob);
      socket.emit('output', { message: 'Summoning successful.' });
      socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} waves his hand and a ${createType.displayName} appears!` });
    } else if (type == 'item') {
      const createType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === "item");

      if (!createType) {
        socket.emit('output', { message: 'Unknown item type.' });
        return;
      }

      let item = new Item({
        name: createType.name,
        desc: createType.desc,
        displayName: createType.displayName,
        type: "item",
      });

      socket.user.inventory.push(item);
      socket.user.save();
      socket.emit('output', { message: 'Item created.' });

      // todo: determine if we want to hide when an admin creates and item      
      //socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} waves his hand and a ${createType.displayName} appears!` });
    } else if (type == 'key') {
      const keyType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === "key");

      if (!keyType) {
        socket.emit('output', { message: 'Unknown key type.' });
        return;
      }

      let key = new Item({
        name: keyType.name,
        desc: keyType.desc,
        displayName: keyType.displayName,
        type: "key",
      });

      socket.user.keys.push(key);
      socket.user.save();
      socket.emit('output', { message: 'Key created.' });
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">spawn mob &lt;mob name&gt; </span><span class="purple">-</span> Create <mob> in current room.<br />';
    output += '<span class="mediumOrchid">spawn item &lt;item name&gt; </span><span class="purple">-</span> Create <item> in inventory.<br />';
    socket.emit('output', { message: output });
  },
};
