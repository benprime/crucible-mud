'use strict';

const globals = require('./globals');
const dirUtil = require('./direction');

module.exports = {
/*
  GetRoomById(roomId, callback) {
    const roomsCollection = globals.DB.collection('rooms');
    roomsCollection.find({ _id: roomId }).toArray((err, docs) => {
      if (docs.length == 0) {
        callback(null);
      } else {
        callback(docs[0]);
      }
    });
  },
*/
  // Refreshes room for everyone currently in it.
  // Used when mobs, items, or exits are added to the room.
  RefreshRoom(io, roomId, callback) {
    const roomsCollection = globals.DB.collection('rooms');
    roomsCollection.find({ _id: roomId }).toArray((err, docs) => {
      // refresh room for all users in the room
      const room = io.sockets.adapter.rooms[roomId];

      // room will not be defined if no one is currently subscribed
      // to it (or perhaps has never been joined yet)
      if (room) {
        // refresh room for every user currently in that room

        // console.log(JSON.stringify(io.sockets.adapter.rooms[roomId].sockets));

        Object.keys(io.sockets.adapter.rooms[roomId].sockets).forEach((socketId) => {
          const s = io.sockets.connected[socketId];
          s.room = docs[0];
        });
        if (callback) callback();
      }
    });
  },

  CreateDoor(io, fromRoomId, dir, toRoomId, callback) {
    // TODO: maybe add a check to make sure it doesn't duplicate doors here?
    globals.DB.collection('rooms').update({ _id: fromRoomId }, { $addToSet: { exits: { dir, roomId: toRoomId } } }, () => {
      console.log(`Adding door to room: ${fromRoomId}, in direction: ${dir}`);
      module.exports.RefreshRoom(io, fromRoomId, callback);
    });
  },

  UpdateRoom(io, roomId, property, value, callback) {
    console.log(`Updating room: ${roomId}`);
    const update = {};
    update[property] = value;
    globals.DB.collection('rooms').update({ _id: roomId }, { $set: update }, () => {
      console.log(`Updating room: ${roomId}`);
      module.exports.RefreshRoom(io, roomId, callback);
    });
  },

  CreateRoom(io, socket, args, callback) {
    let dir = args[0];

    // validate input
    if (!dirUtil.ValidDirectionInput(dir)) {
      socket.emit('output', { message: 'Not valid.' });
      return;
    }

    dir = dirUtil.LongToShort(dir);

    // This refresh is a little paranoid... but just trying to make sure we have
    // the latest mongo data before we attempt to create a door that may already exists
    // based on some network hang?
    // (two admins trying to create a door, in the same room, in the same direction, at the same time)
    module.exports.RefreshRoom(io, socket.room._id, () => {
      // check if the door already exists (if door exists, room must)
      if (socket.room.exits.find(door => door.dir === dir)) {
        socket.emit('output', { message: 'An exit in that direction already exists!' });
      } else {
        const roomCollection = globals.DB.collection('rooms');

        const targetCoords = dirUtil.DirectionToCoords(socket, dir);

        // check if door exists by coords (created from another route)
        roomCollection.find(targetCoords).toArray((err, docs) => {
          // if room exists at destination coordinates, just create door.
          if (docs.length > 0) {
            const newRoom = docs[0];

            console.log(`Creating room to the ${dir} - room found - adding doors only.`);

            // create both doors
            // dirty async callback spaghetti... refactor with async library?
            module.exports.CreateDoor(io, socket.room._id, dir, newRoom._id, () => {
              module.exports.CreateDoor(io, newRoom._id, dirUtil.OppositeDirection(dir), socket.room._id, callback);
            });
          } else {
            console.log(`Creating new room to the ${dir}`);
            // create a new room w/ return exit
            const oppDir = dirUtil.OppositeDirection(dir);
            const newRoom = {
              name: 'Default Room Name',
              desc: 'Room Description',
              x: targetCoords.x,
              y: targetCoords.y,
              z: targetCoords.z,
              exits: [{
                dir: oppDir,
                roomId: socket.room._id,
              }],
            };

            roomCollection.insert(newRoom, {}, (err, records) => {
              if (err) {
                console.log(`Couldn't create room: ${err}`);
                return;
              }
              const toRoomId = records.insertedIds[0];
              module.exports.CreateDoor(io, socket.room._id, dir, toRoomId, callback);
            });
          }
        });
      }
    });
  },
};
