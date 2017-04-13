'use strict';

const roomManager = require('../roomManager');
const mobData = require('../data/mobData');
//const ObjectId = require('mongodb').ObjectId;
const Mob = require('../models/mob');

module.exports = {
  name: 'spawn',

  patterns: [
    /^spawn\s+?(\w+)/i
  ],

  dispatch(socket, match) {
    if(match.length != 2) {
      socket.emit('output', { message: 'invalid spawn.' });
      return;
    }
    let mobTypeName = match[1];
    console.log("Attempting to spawn: ", mobTypeName);
    module.exports.execute(socket, mobTypeName);
  },

  execute(socket, mobTypeName) {

    if (!socket.user.admin) return;

    //todo: currently, this error will never get hit
    if (!mobTypeName) {
      socket.emit('output', { message: 'Must pass mob type.' });
      return;
    }

    const createType = mobData.catalog.find(mob => mob.name.toLowerCase() === mobTypeName.toLowerCase());

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
},

  help() {},
}
