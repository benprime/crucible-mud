var dirUtil = require('./direction');
var globals = require('./globals');

function UpdateRoom(io, roomId, property, value, callback) {
  console.log("Updating room: " + roomId);
  update = {};
  update[property] = value;
  var result = globals.DB.collection('rooms').update({ _id: roomId }, { $set: update }, function() {
    console.log("Updating room: " + roomId);
    RefreshRoom(io, roomId, callback);
  });
}

function RefreshRoom(io, roomId, callback) {
  var roomsCollection = globals.DB.collection('rooms');
  roomsCollection.find({ _id: roomId }).toArray(function(err, docs) {
    // refresh room for all users in the room
    for (var socketId in io.sockets.adapter.rooms[roomId].sockets) {
      var s = io.sockets.connected[socketId];
      s.room = docs[0];
    };
    if (callback) callback();
  });
}

function CreateRoom(io, socket, args, callback) {
  var dir = args[0];

  // validate input
  if (!dirUtil.ValidDirection(dir)) {
    socket.emit('output', { message: "Not valid." });
    return;
  }

  // todo: refresh current rooms from mongo before checks!


  // check if the door already exists (if door exists, room must)
  if (socket.room.exits && dir in socket.room.exits) {
    socket.emit('output', { message: "An exit in that direction already exists!" });
  } else {
    var roomCollection = globals.DB.collection('rooms');

    var targetCoords = dirUtil.DirectionToCoords(socket, dir);

    // check if door exists by coords (created from another route)
    roomCollection.find({ x: targetCoords.x, y: targetCoords.y, z: targetCoords.z }).toArray(function(err, docs) {
      // if room exists at destination coordinates, just create door.
      if (docs.length > 0) {
        var newRoom = docs[0];

        // create both doors
        // dirty async callback spaghetti... refactor with async library
        UpdateRoom(io, socket.room._id, "exits." + dir, newRoom._id, function() {
          UpdateRoom(io, newRoom._id, "exits." + dirUtil.OppositeDirection(dir), socket.room._id, callback);
        });

      } else {
        console.log("Creating new room.");
        // create a new room w/ return exit
        var oppDir = dirUtil.OppositeDirection(dir);
        var newRoom = {
          "name": "Default Room Name",
          "desc": "Room Description",
          "x": targetCoords.x,
          "y": targetCoords.y,
          "z": targetCoords.z,
          "exits": {}
        };
        newRoom.exits[oppDir] = socket.room._id;

        roomCollection.insert(newRoom, {}, function(err, records) {
          if (err) {
            console.log("Couldn't create room: " + err);
          }

          var toRoomId = records['insertedIds'][0];

          // create door back to the existing room
          UpdateRoom(io, socket.room._id, "exits." + dir, toRoomId, callback);
        });
      }
    });
  }
}

function CreateItem(socket, name, callback) {
  var item = {
    "name": name,
    "desc": "Default description."
  };

  // todo: write item to user inventory in mongo immediately to preserve state
  if (!socket.inventory) socket.inventory = [];
  socket.inventory.push(item);

  socket.emit('output', { message: 'Item added to inventory.' });
  socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' has created a ' + name + ' out of thin air.' });
}

module.exports = function(io) {
  return {
    CreateDispatch: function(socket, command, commandString, lookCallback) {
      if (command.length > 2) {
        var subject = command[1].toLowerCase();
        var args = command.slice(2); // pop off "create" and subject.

        switch (subject) {
          case 'room':
            var dir = args[0];
            CreateRoom(io, socket, args, function() {
              socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' has created a room to the ' + dirUtil.DisplayDirection(dir) + '.' });
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

            UpdateRoom(io, socket.room._id, property, value, function() {
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
    }
  };
}
