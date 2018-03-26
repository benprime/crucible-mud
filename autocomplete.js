'use strict';

require('./extensionMethods');
const Room = require('./models/room');

// properties in order of search use
const propertyNames = ['displayName', 'name'];

// ------------------------------------------
// TypeConfigs objects:
// - source: The array to search for objects.
// ------------------------------------------
const TypeConfig = Object.freeze({
  mob: {
    source: function (socket) {
      const room = Room.getById(socket.user.roomId);
      return room.mobs;
    },
  },
  inventory: {
    source: function (socket) {
      return socket.user.inventory;
    },
  },
  key: {
    source: function (socket) {
      return socket.user.keys;
    },
  },
  room: {
    source: function (socket) {
      const room = Room.getById(socket.user.roomId);
      return room.inventory;
    },
  },
});

function distinctByProperty(arr, property) {
  var alreadyAdded = {};
  return arr.filter(function (obj) {
    if (alreadyAdded[obj[property]]) return false;
    alreadyAdded[obj[property]] = true;
    return true;
  });
}

function autocompleteByProperty(source, property, fragment) {
  const distinctSource = distinctByProperty(source, property);
  const re = new RegExp(`^${fragment}`, 'i');
  return distinctSource.filter(value => !!re.exec(value[property]));
}

function autocompleteTypes(socket, types, fragment) {
  for (var typeKey in types) {
    if (!types.hasOwnProperty(typeKey)) continue;

    let type = types[typeKey];
    let typeConfig = TypeConfig[type];
    if (!typeConfig) {
      throw `Invalid type: ${type}`;
    }
    let source = typeConfig.source(socket);

    for (var prop of propertyNames) {
      let result = autocompleteByProperty(source, prop, fragment);

      if (result.length > 0) {
        return {
          type: type,
          item: result[0],
        };
      }
    }
  }

  socket.emit('output', { message: 'You don\'t see that here.' });
  return null;
}

module.exports = {
  autocompleteTypes,
  autocompleteByProperty,
};
