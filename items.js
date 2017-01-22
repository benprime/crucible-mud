var globals = require('./globals');
var rooms = require('./rooms');

module.exports = function(io) {

  return {
    // returns first item that matches name
    CreateItem: function(socket, item, callback) {
      // add to player's inventoryin mongo
      globals.DB.collection('users').update({ _id: socket.userId }, { $addToSet: { "inventory": item } }, function() {
        // add item to player's current inventory
        socket.inventory.push(item);
        if (callback) callback();
      });
    },
    DropItem: function(socket, itemName, callback) {
      var item = socket.inventory.GetFirstByName(itemName);
      if (!item) {
        socket.emit("output", { message: "You don't seem to have a " + itemName + "." })
        return;
      }
      // remove from user in mongo
      globals.DB.collection('users').update({ _id: socket.userId }, { $pull: { inventory: { _id: item._id } } }, function() {
        // add to room
        globals.DB.collection('rooms').update({ _id: socket.room._id }, { $addToSet: { "inventory": item } }, function() {
          // refresh the room for all players currently joined to it
          rooms.RefreshRoom(io, socket.room._id, function() {
            socket.emit("output", { message: "Item dropped." })
            socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' drops ' + item.name + '.' });
            if (callback) callback();
          });
        });
      });

      // remove from player's current inventory
      socket.inventory = socket.inventory.filter(function(obj) {
        //todo: check if this toString was necessary.
        return obj._id.toString() !== item._id.toString();
      });

    },
    TakeItem: function(socket, itemName, callback) {
      var item = socket.room.inventory.GetFirstByName(itemName);
      if (!item) {
        socket.emit("output", { message: "You don't see that item here." })
        return;
      }

      if (item.fixed) {
        socket.emit("output", { message: "You cannot take that!" })
        return;
      }

      // remove from room in mongo
      globals.DB.collection('rooms').update({ _id: socket.room._id }, { $pull: { inventory: { _id: item._id } } }, function() {
        // refresh the room for all players currently joined to it
        rooms.RefreshRoom(io, socket.room._id, function() {
          // add to player's inventoryin mongo
          globals.DB.collection('users').update({ _id: socket.userId }, { $addToSet: { "inventory": item } }, function() {
            // add item to player's current inventory
            socket.inventory.push(item);
            socket.emit("output", { message: "Taken." })
            socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' takes ' + item.name + '.' });
            if (callback) callback();
          });
        });
      });
    },
    SetItem: function(socket, itemName, property, value) {
      if (!socket.admin) return;

      var item = socket.inventory.GetFirstByName(itemName) || socket.room.inventory.GetFirstByName(itemName);
      if (!item) {
        socket.emit("output", { message: "You don't see that anywhere!" });
        return;
      }

      // todo: finish this method and save to the database
      item.property = value;
    }
  }
}
