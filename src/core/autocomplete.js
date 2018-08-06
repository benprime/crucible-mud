import Room from '../models/room';

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

    // todo: we're just returning the first object that isn't null
    // review this and see if returning multiple objects might be
    // a better strategy.
    for (const prop of propertyNames) {
      let results = autocompleteByProperty(source, prop, fragment);

      // TODO: Is 'item' the best name for this?
      // This can be anything... a mob, a key, a player, etc.
      if (results.length > 0) {
        return {
          type,
          item: results[0],
        };
      }
    }
  }

  socket.emit('output', { message: 'You don\'t see that here.' });
  return null;
}

export default {
  autocompleteTypes,
  autocompleteByProperty,
};
