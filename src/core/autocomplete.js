import Room from '../models/room';

/**
 * TypeConfigs - Holds configurations for doing common autocomplete operations.
 * - source: The array to search for objects.
 * - propertyNames: The properties to use for autocomplete (in order)
 */
const TypeConfig = Object.freeze({
  mob: {
    source(character) {
      const room = Room.getById(character.roomId);
      return room.mobs;
    },
    propertyNames: ['adjective', 'name', 'class'],
  },
  inventory: {
    source(character) {
      return character.inventory;
    },
    propertyNames: ['name', 'name'],
  },
  key: {
    source(character) {
      return character.keys;
    },
    propertyNames: ['name', 'name'],
  },
  room: {
    source(character) {
      const room = Room.getById(character.roomId);
      return room.inventory;
    },
    propertyNames: ['name', 'name'],
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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Filters array of objects to first object found for each unique property value.
 * @param {Array} objects - Array of object to filter.
 * @param {String} propertyName - Property to filter with.
 * @returns {Array} Array of objects such that each property value is unique.
 */
function distinctByProperty(objects, propertyName) {
  const alreadyAdded = {};
  return objects.filter(obj => {
    if (alreadyAdded[obj[propertyName]]) return false;
    alreadyAdded[obj[propertyName]] = true;
    return true;
  });
}

export default {

  /**
   * Get all objects in an enumerable that match the autocomplete filter.
   * @param {Array} source - Enumerable to find matching objects.
   * @param {String} propertyName - Property name to use for pattern matching.
   * @param {String} fragment - Search term for autocompleting property value.
   * @returns {Array} - Array of objects that matches the property value filter.
   */
  byProperty(source, propertyName, fragment) {
    // if multiple items have the exact same value for a particular property
    // then we only consider the first object found with that value.
    const distinctSource = distinctByProperty(source, propertyName);
    const re = new RegExp(`^${escapeRegExp(fragment)}`, 'i');

    return distinctSource.filter(obj => {
      if (!obj[propertyName]) return false;
      if (!typeof obj[propertyName] === 'string' && !(obj[propertyName] instanceof String)) return false;

      // if there are spaces in the property value, then we consider each word.
      const propValueArr = obj[propertyName].split(/\s+/);
      return propValueArr.some(v => !!re.exec(v));
    });
  },

  /**
   * Get objects that match autocomplete filter for multiple properties.
   * @param {Array} source - Enumerable to find matching objects.
   * @param {Array} propertyNames - Properties to apply pattern matching to.
   * @param {String} fragment - Search term to be used against all properties.
   * @returns {Array} - Array of objects where any of the properties matched the filter.
   */
  byProperties(source, propertyNames, fragment) {
    const resultArr = [];
    for (const prop of propertyNames) {
      let results = this.byProperty(source, prop, fragment);
      resultArr.push(results);
    }

    // combine result arrays for each property
    const combArr = [].concat(...resultArr);

    // dedupe (a single item could be found multiple times by different properties)
    return [...new Set(combArr)];
  },

  match(character, types, fragment) {
    const results = [];

    for (const typeKey in types) {
      if (!types.hasOwnProperty(typeKey)) continue;

      let type = types[typeKey];
      let typeConfig = TypeConfig[type];
      if (!typeConfig) {
        throw `Invalid type: ${type}`;
      }

      let source = typeConfig.source(character);
      let typeResult = this.byProperties(source, typeConfig.propertyNames, fragment);

      results.push({
        type: type,
        items: typeResult,
      });
    }

    return results;
  },

  /**
   * Autocompletes a name fragment using multiple game object types and returns the object.
   * @param {Character} character - Character performing this action.
   * @param {Array} types - Types to include in the autocomplete operation.
   * @param {String} fragment - Beginning portion of object name to autocomplete.
   * @returns {Array} - First result that matched using the type matching configs.
   */
  multiple(character, types, fragment) {
    for (const typeKey in types) {
      if (!types.hasOwnProperty(typeKey)) continue;

      let type = types[typeKey];
      let typeConfig = TypeConfig[type];
      if (!typeConfig) {
        throw `Invalid type: ${type}`;
      }

      let source = typeConfig.source(character);
      const results = this.byProperties(source, typeConfig.propertyNames, fragment);

      // always returning the first one found
      if (results.length > 0) {
        return {
          type,
          item: results[0],
        };
      }
    }
    return null;
  },

  /**
   * Autocomplete character objects by name fragment.
   * @param {Character} character - Character performing this operation.
   * @param {String} fragment - Name fragment to autocomplete.
   */
  character(character, fragment) {
    var result = this.multiple(character, ['character'], fragment);
    return result ? result.item : null;
  },

  /**
   * Autocomplete mob objects by name fragment.
   * @param {Character} character - Character performing this operation.
   * @param {String} fragment - Name fragment to autocomplete.
   */
  mob(character, fragment) {
    var result = this.multiple(character, ['mob'], fragment);
    return result ? result.item : null;
  },

  /**
   * Autocomplete inventory objects by name fragment.
   * @param {Character} character - Character performing this operation.
   * @param {String} fragment - Name fragment to autocomplete.
   */
  inventory(character, fragment) {
    var result = this.multiple(character, ['inventory'], fragment);
    return result ? result.item : null;
  },

  /**
   * Autocomplete key objects by name fragment.
   * @param {Character} character - Character performing this operation.
   * @param {String} fragment - Name fragment to autocomplete.
   */
  key(character, fragment) {
    var result = this.multiple(character, ['key'], fragment);
    return result ? result.item : null;
  },

  /**
   * Autocomplete room inventory objects by name fragment.
   * @param {Character} character - Character performing this operation.
   * @param {String} fragment - Name fragment to autocomplete.
   */
  room(character, fragment) {
    var result = this.multiple(character, ['room'], fragment);
    return result ? result.item : null;
  },
};
