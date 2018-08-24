import Room from '../models/room';

//TODO: make this library use promises
//TODO: change the names of the function here to be:
// autocomplete.byTypes, autocomplete.player, etc.


// -------------------------------------------------------------------
// TypeConfigs objects:
// - source: The array to search for objects.
// - propertyNames: The properties to use for autocomplete (in order)
// -------------------------------------------------------------------
const TypeConfig = Object.freeze({
  mob: {
    source(character) {
      const room = Room.getById(character.roomId);
      return room.mobs;
    },
    propertyNames: ['displayName', 'name'],
  },
  inventory: {
    source(character) {
      return character.inventory;
    },
    propertyNames: ['displayName', 'name'],
  },
  key: {
    source(character) {
      return character.keys;
    },
    propertyNames: ['displayName', 'name'],
  },
  room: {
    source(character) {
      const room = Room.getById(character.roomId);
      return room.inventory;
    },
    propertyNames: ['displayName', 'name'],
  },
  player: {
    source(character) {
      return Object.values(global.io.sockets.connected)
        .filter(s => s.character && s.character != character.id)
        // TODO: This should probably return their character, not user.
        // Character name needs to be used throughout the game instead of username.
        .map(s => s.user);
    },

    propertyNames: ['username'],
  },
  character: {
    source(character) {
      return Object.values(global.io.sockets.connected)
        .filter(s => s.character && s.character != character.id)
        .map(s => s.character);
    },
    propertyNames: ['name'],
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

  autocompleteByProperties(source, propertyNames, fragment) {
    const resultArr = [];
    for (const prop of propertyNames) {
      let results = this.autocompleteByProperty(source, prop, fragment);
      resultArr.push(results);
    }

    const combArr = [].concat(...resultArr);
    return [...new Set(combArr)];
  },

  /**
   * Autocompletes a name fragment using multiple game object types and returns the object.
   * @param {*} character - character performing this action.
   * @param {*} types - types to include in the autocomplete operation.
   * @param {*} fragment - Beginning portion of object name to autocomplete.
   */
  autocompleteTypes(character, types, fragment) {
    for (const typeKey in types) {
      if (!types.hasOwnProperty(typeKey)) continue;

      let type = types[typeKey];
      let typeConfig = TypeConfig[type];
      if (!typeConfig) {
        throw `Invalid type: ${type}`;
      }

      let source = typeConfig.source(character);
      const results = this.autocompleteByProperties(source, typeConfig.propertyNames, fragment);
      if (results.length > 0) {
        return {
          type,
          item: results[0],
        };
      }
    }
    //return Promise.reject('You don\'t see that here.');
    return null;
  },

  /**
   * Autocomplete character objects by name fragment.
   * @param {*} character - Character performing this operation.
   * @param {*} fragment - Name fragment to autocomplete.
   */
  character(character, fragment) {
    var result = this.autocompleteTypes(character, ['character'], fragment);
    return result ? result.item : null;
  },
};
