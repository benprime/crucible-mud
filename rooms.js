var globals = require('./globals');
var dirUtil = require('./direction');

module.exports = {
  RefreshRoom: function(io, roomId, callback) {
    var roomsCollection = globals.DB.collection('rooms');
    roomsCollection.find({ _id: roomId }).toArray(function(err, docs) {
      // refresh room for all users in the room
      var room = io.sockets.adapter.rooms[roomId];
      if (room) // room will not be defined if no one is currently subscribed to it (or perhaps has never been joined yet)
      {
        // refresh room for every user currently in that room
        for (var socketId in io.sockets.adapter.rooms[roomId].sockets) {
          var s = io.sockets.connected[socketId];
          s.room = docs[0];
        };
      }
      if (callback) callback();
    });
  },

  CreateDoor: function(io, fromRoomId, dir, toRoomId, callback) {
    //TODO: maybe add a check to make sure it doesn't duplicate doors here?
    globals.DB.collection('rooms').update({ _id: fromRoomId }, { $addToSet: { "exits": { "dir": dir, "roomId": toRoomId } } }, function() {
      console.log("Adding door to room: " + fromRoomId + ", in direction: " + dir);
      module.exports.RefreshRoom(io, fromRoomId, callback);
    });
  },

  UpdateRoom: function(io, roomId, property, value, callback) {
    console.log("Updating room: " + roomId);
    update = {};
    update[property] = value;
    var result = globals.DB.collection('rooms').update({ _id: roomId }, { $set: update }, function() {
      console.log("Updating room: " + roomId);
      module.exports.RefreshRoom(io, roomId, callback);
    });
  },

  CreateRoom: function(io, socket, args, callback) {
    var dir = args[0];

    // validate input
    if (!dirUtil.ValidDirection(dir)) {
      socket.emit('output', { message: "Not valid." });
      return;
    }

    // This refresh is a little paranoid... but just trying to make sure we have
    // the latest mongo data before we attempt to create a door that may already exists
    // based on some network hang?
    // (two admins trying to create a door, in the same room, in the same direction, at the same time)
    module.exports.RefreshRoom(io, socket.room._id, function() {


      // check if the door already exists (if door exists, room must)
      if (socket.room.exits.find(door => door.dir === dir)) {
        socket.emit('output', { message: "An exit in that direction already exists!" });
      } else {
        var roomCollection = globals.DB.collection('rooms');

        var targetCoords = dirUtil.DirectionToCoords(socket, dir);

        // check if door exists by coords (created from another route)
        roomCollection.find({ x: targetCoords.x, y: targetCoords.y, z: targetCoords.z }).toArray(function(err, docs) {
          // if room exists at destination coordinates, just create door.
          if (docs.length > 0) {
            var newRoom = docs[0];

            console.log("Creating room to the " + dir + " - room found - adding doors only.");

            // create both doors
            // dirty async callback spaghetti... refactor with async library?
            module.exports.CreateDoor(io, socket.room._id, dir, newRoom._id, function() {
              module.exports.CreateDoor(io, newRoom._id, dirUtil.OppositeDirection(dir), socket.room._id, callback);
            });

          } else {
            console.log("Creating new room to the " + dir);
            // create a new room w/ return exit
            var oppDir = dirUtil.OppositeDirection(dir);
            var newRoom = {
              "name": "Default Room Name",
              "desc": "Room Description",
              "x": targetCoords.x,
              "y": targetCoords.y,
              "z": targetCoords.z,
              "exits": [{
                "dir": oppDir,
                "roomId": socket.room._id
              }]
            };

            roomCollection.insert(newRoom, {}, function(err, records) {
              if (err) {
                console.log("Couldn't create room: " + err);
                return;
              }
              var toRoomId = records['insertedIds'][0];
              module.exports.CreateDoor(io, socket.room._id, dir, toRoomId, callback);
            });
          }
        });
      }
    });
  }
};
