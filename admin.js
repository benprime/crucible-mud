var dirUtil = require('./direction');
var globals = require('./globals')

function UpdateDoor(fromRoomId, dir, toRoomId, callback) {
  // making an object for dynamic dictionary key
  update = {};
  update["exits." + dir] = toRoomId;
  var result = globals.DB.collection('rooms').update({ _id: fromRoomId }, { $set: update }, callback);
}

function UpdateRoom(io, socket, property, value, callback) {
  update = {};
  update[property] = value;
  var result = globals.DB.collection('rooms').update({ _id: socket.room._id }, { $set: update }, function() {
    RefreshRoom(io, socket, callback);
  });
}

function RefreshRoom(io, socket, callback) {
  var roomsCollection = globals.DB.collection('rooms');
  roomsCollection.find({ _id: socket.room._id }).toArray(function(err, docs) {
    // refresh room for all users in the room
    for (var socketId in io.sockets.adapter.rooms[socket.room._id].sockets) {
      //var s = io.sockets.adapter.rooms[socket.room._id].sockets;
      //console.log("socket: " + JSON.stringify(s));
      var s = io.sockets.connected[socketId];
      //var s = io.sockets.connected[socketId];
      s.room = docs[0];
      // todo: force a look on the other sockets?
    };
    if (callback) callback();

    //socket.room = docs[0];
    console.log("Refresh room: " + JSON.stringify(docs[0]));
    //socket.emit('output', { message: "" }); // just forcing a blank line
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
    console.log(JSON.stringify(targetCoords));

    // check if door exists by coords (created from another route)
    console.log("Looking for: " + JSON.stringify({ x: targetCoords.x, y: targetCoords.y, z: targetCoords.z }));
    roomCollection.find({ x: targetCoords.x, y: targetCoords.y, z: targetCoords.z }).toArray(function(err, docs) {
      // if room exists at destination coordinates, just create door.
      if (docs.length > 0) {
        var newRoom = docs[0];
        console.log("Room found: " + JSON.stringify(newRoom));

        // create both doors
        // dirty async callback spaghetti... refactor with async library
        UpdateDoor(socket.room._id, dir, newRoom._id, function() {
          UpdateDoor(newRoom._id, dirUtil.OppositeDirection(dir), socket.room._id, function() {
            RefreshRoom(io, socket, callback);
          });
        });

      } else {
        console.log("Creating new room.");
        // create a new room w/ return exit
        var oppDir = dirUtil.OppositeDirection(dir);
        var newRoom = {
          "title": "Default Room Title",
          "description": "Room Description",
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
          UpdateDoor(socket.room._id, dir, toRoomId, function() {
            RefreshRoom(io, socket, callback);
          });
        });
      }
    });
  }
}

function CreateItem(socket, args) {
  socket.emit('output', { message: "Not implemented." });
}

module.exports = function(io) {
  return {
    CreateDispatch: function(socket, command, callback) {
      if (command.length >= 2) {
        var subject = command[1];
        var args = command.splice(2); // pop off "create" and subject.

        if (subject.toLowerCase() == "room") {
          CreateRoom(io, socket, args, callback);
          return;
        }

        if (subject.toLowerCase() == "item") {
          CreateItem(socket, args, callback);
          return;
        }
      }

      socket.emit('output', { message: "Invalid command." });
    },

    SetDispatch: function(socket, command, commandString, callback) {
      if (command.length >= 3) {
        var subject = command[1].toLowerCase();

        if (subject == "title") {
          var value = commandString.replace(/^set\s+title\s+/i, '').trim();
          console.log("new value: " + value);
          UpdateRoom(io, socket, "title", value, callback);
          return;
        }

        if (subject == "desc") {
          var value = commandString.replace(/^set\s+desc\s+/i, '').trim();
          UpdateRoom(io, socket, "description", value, callback);
          return;
        }
      }

      socket.emit('output', { message: "Invalid command." });
    }
  };
}
