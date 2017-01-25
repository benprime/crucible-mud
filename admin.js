'use strict';

const dirUtil = require('./direction');
const ObjectId = require('mongodb').ObjectID;
const mobData = require('./data/mobData');
const globals = require('./globals');
const rooms = require('./rooms');

module.exports = function(io) {
  const items = require('./items')(io);


  // TODO: update this to create an item instance from the item catalog
  function CreateItem(socket, name, callback) {
    const item = {
      _id: new ObjectId(),
      name,
      desc: 'Default description.',
    };

    items.CreateItem(socket, item, () => {
      socket.emit('output', { message: 'Item added to inventory.' });
      socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} has created a ${name} out of thin air.` });
      if (callback) callback();
    });
  }

  return {
    CreateDispatch(socket, command, commandString, lookCallback) {
      if (!socket.admin) return;
      if (command.length > 2) {
        const subject = command[1].toLowerCase();
        const args = command.slice(2); // pop off "create" and subject.

        switch (subject) {
          case 'room':
            {
              const dir = args[0];
              rooms.CreateRoom(io, socket, args, () => {
                socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} has created a room to the ${dirUtil.ExitName(dir)}.` });
                lookCallback();
              });
              break;
            }
          case 'item':
            {
              const name = commandString.replace(/^create\s+item\s+/i, '').trim();
              CreateItem(socket, name);
              break;
            }
          default:
            socket.emit('output', { message: 'Invalid command.' });
        }
      }
    },

    SetDispatch(socket, command, commandString, lookCallback) {
      if (!socket.admin) return;
      if (command.length >= 3) {
        const subject = command[1].toLowerCase();
        const property = command[2].toLowerCase();

        switch (subject) {
          case 'room':
            {
              const roomPropertyWhiteList = ['name', 'desc'];
              if (roomPropertyWhiteList.indexOf(property) === -1) {
                socket.emit('output', { message: 'Invalid property.' });
                return;
              }

              // replace all instances of multiple spaces with a single space
              let value = commandString.replace(/\s+/g, ' ').trim();
              value = value.replace(`set room ${property} `, '');

              rooms.UpdateRoom(io, socket.room._id, property, value, () => {
                socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} has altered the fabric of reality.` });
                lookCallback();
              });
              break;
            }
          case 'item':
            {
              socket.emit('output', { message: 'Not implemented.' });
              break;
            }
          default:
            {
              socket.emit('output', { message: 'Invalid command.' });
            }
        }
      }
    },

    ListMobs(socket) {
      if (!socket.admin) return;

      let output = '<table><tr><th>Name</th><th>Display Name</th></tr>';

      const mobTable = mobData.catalog.map(mob => `<tr><td>${mob.name}</td><td>${mob.displayName}</td></tr>`).join('\n');
      output += mobTable;

      output += '</table>';
      console.log(output);

      socket.emit('output', { message: output });
    },

    Spawn(socket, mobTypeName, callback) {
      if (!socket.admin) return;

      if (!mobTypeName) {
        socket.emit('output', { message: 'Must pass mob type.' });
        return;
      }

      const createType = mobData.catalog.find(mob => mob.name.toLowerCase() === mobTypeName.toLowerCase());

      if (!createType) {
        socket.emit('output', { message: 'Unknown mob type.' });
        return;
      }

      if (!globals.MOBS[socket.room._id]) globals.MOBS[socket.room._id] = [];

      globals.MOBS[socket.room._id].push(createType);
      socket.emit('output', { message: 'Summoning successful.' });
      socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} waves his hand and a ${createType.displayName} appears!` });

      if (callback) callback();
    },
  };
};
