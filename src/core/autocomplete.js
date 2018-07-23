const Room = require('../models/room');

// properties in order of search use
const propertyNames = ['displayName', 'name'];

// ------------------------------------------
// TypeConfigs objects:
// - source: The array to search for objects.
// ------------------------------------------
const TypeConfig = Object.freeze({
  mob: {
    source({user}) {
      const room = Room.getById(user.roomId);
      return room.mobs;
    },
  },
  inventory: {
    source({user}) {
      return user.inventory;
    },
  },
  key: {
    source({user}) {
      return user.keys;
    },
  },
  room: {
    source({user}) {
      const room = Room.getById(user.roomId);
      return room.inventory;
    },
  },
});

function distinctByProperty(arr, property) {
  const alreadyAdded = {};
  return arr.filter(obj => {
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
  for (const typeKey in types) {
    if (!types.hasOwnProperty(typeKey)) continue;

    let type = types[typeKey];
    let typeConfig = TypeConfig[type];
    if (!typeConfig) {
      throw `Invalid type: ${type}`;
    }
    let source = typeConfig.source(socket);

    for (const prop of propertyNames) {
      let result = autocompleteByProperty(source, prop, fragment);

      // TODO: Is 'item' the best name for this?
      // This can be anything... a mob, a key, a player, etc.
      if (result.length > 0) {
        return {
          type,
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
