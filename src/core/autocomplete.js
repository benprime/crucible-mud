import Room from '../models/room';

// -------------------------------------------------------------------
// TypeConfigs objects:
// - source: The array to search for objects.
// - propertyNames: The properties to use for autocomplete (in order)
// -------------------------------------------------------------------
const TypeConfig = Object.freeze({
  mob: {
    source({ character }) {
      const room = Room.getById(character.roomId);
      return room.mobs;
    },
    propertyNames: ['displayName', 'name'],
  },
  inventory: {
    source({ character }) {
      return character.inventory;
    },
    propertyNames: ['displayName', 'name'],
  },
  key: {
    source({ character }) {
      return character.keys;
    },
    propertyNames: ['displayName', 'name'],
  },
  room: {
    source({ character }) {
      const room = Room.getById(character.roomId);
      return room.inventory;
    },
    propertyNames: ['displayName', 'name'],
  },
  player: {
    source({ user }) {
      return Object.values(global.io.sockets.connected)
        .filter(s => s.user && s.user.id != user.id)
        .map(s => s.user);
    },
    propertyNames: ['username'],
  },

});

export default {
  distinctByProperty(arr, property) {
    const alreadyAdded = {};
    return arr.filter(obj => {
      if (alreadyAdded[obj[property]]) return false;
      alreadyAdded[obj[property]] = true;
      return true;
    });
  },

  autocompleteByProperty(source, property, fragment) {
    const distinctSource = this.distinctByProperty(source, property);
    const re = new RegExp(`^${fragment}`, 'i');
    return distinctSource.filter(value => !!re.exec(value[property]));
  },

  autocompleteTypes(socket, types, fragment) {
    for (const typeKey in types) {
      if (!types.hasOwnProperty(typeKey)) continue;

      let type = types[typeKey];
      let typeConfig = TypeConfig[type];
      if (!typeConfig) {
        throw `Invalid type: ${type}`;
      }
      let source = typeConfig.source(socket);

      // Returning the first match among all the types involved.
      for (const prop of typeConfig.propertyNames) {
        let results = this.autocompleteByProperty(source, prop, fragment);

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
  },
};
