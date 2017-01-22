var dirUtil = require('./direction');
var ObjectId = require('mongodb').ObjectID;
var mobData = require('./data/mobData')
var globals = require('./globals');
var rooms = require('./rooms');

module.exports = function(io) {
  var items = require('./items')(io);


  //TODO: update this to create an item instance from the item catalog
  function CreateItem(socket, name, callback) {
    var item = {
      "_id": new ObjectId(),
      "name": name,
      "desc": "Default description."
    };

    items.CreateItem(socket, item, function() {
      socket.emit('output', { message: 'Item added to inventory.' });
      socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' has created a ' + name + ' out of thin air.' });
    });
  }

  return {
    CreateDispatch: function(socket, command, commandString, lookCallback) {
      if(!socket.admin) return;
      if (command.length > 2) {
        var subject = command[1].toLowerCase();
        var args = command.slice(2); // pop off "create" and subject.

        switch (subject) {
          case 'room':
            var dir = args[0];
            rooms.CreateRoom(io, socket, args, function() {
              socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' has created a room to the ' + dirUtil.ExitName(dir) + '.' });
              lookCallback();
            });
            break;
          case 'item':
            var name = commandString.replace(/^create\s+item\s+/i, '').trim();
            CreateItem(socket, name);
            break;
          default:
            socket.emit('output', { message: "Invalid command." });
        }
      }
    },

    SetDispatch: function(socket, command, commandString, lookCallback) {
      if(!socket.admin) return;
      if (command.length >= 3) {
        var subject = command[1].toLowerCase();
        var property = command[2].toLowerCase();

        switch (subject) {
          case 'room':
            var roomPropertyWhiteList = ["name", "desc"];
            if (roomPropertyWhiteList.indexOf(property) === -1) {
              socket.emit('output', { message: 'Invalid property.' });
              return;
            }

            // replace all instances of multiple spaces with a single space
            var value = commandString.replace(/\s+/g, ' ').trim();
            value = value.replace('set room ' + property + ' ', '');

            rooms.UpdateRoom(io, socket.room._id, property, value, function() {
              socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' has altered the fabric of reality.' });
              lookCallback();
            });
            break;

          case 'item':
            socket.emit('output', { message: 'Not implemented.' });
            break;
          default:
            socket.emit('output', { message: "Invalid command." });
        }
      }
    },

    Spawn: function(socket, mobTypeName, callback) {
      if(!socket.admin) return;

      var createType = mobData.catalog.find(function(mob) {
        return mob.name.toLowerCase() == mobTypeName.toLowerCase();
      });

      if(!createType) {
        socket.emit('output', {message: "Unknown mob type."})
        return;
      }

      if(!globals.MOBS[socket.room._id]) globals.MOBS[socket.room._id] = [];

      globals.MOBS[socket.room._id].push(createType);

      if(callback) callback();
    }
  };
}
