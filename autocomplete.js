'use strict';

require('./extensionMethods');
const roomManager = require('./roomManager');

const TargetTypes = Object.freeze({
  Mob: 'mob',
  Inventory: 'inventory',
  Key: 'key',
  Room: 'room',
});

function getTargetList(socket, target) {
  const room = roomManager.getRoomById(socket.user.roomId);
  switch (target) {
    case TargetTypes.Mob:
      return room.mobs;
    case TargetTypes.Inventory:
      return socket.user.inventory;
    case TargetTypes.Key:
      return socket.user.keys;
    case TargetTypes.Room:
      return room.inventory;
    default:
      throw new Error('Invalid target.');
  }
}

function ambigiousMessage(results) {
  let output = 'Which did you mean?\n';
  results.forEach(r => {
    output += `- ${r.displayName}\n`;
  });
  return output;
}

function autocompleteByProperty(socket, targets, property, fragment) {

  let results = [];

  targets.forEach(target => {
    const list = getTargetList(socket, target);
    const names = list.map(i => i[property]).distinct();
    var matches = global.filterMatch(names, fragment);
    if (matches.length > 0) {
      let matched = matches.map(matchedString => {
        return {
          target: target,
          matchedValue: matchedString,
          property: property,
        };
      });
      results = results.concat(matched);
    }
  });

  return results;
}

module.exports = {

  TargetTypes: TargetTypes,

  autocomplete(socket, targets, fragment) {
    const displayNameResults = autocompleteByProperty(socket, targets, 'displayName', fragment);
    const nameResults = autocompleteByProperty(socket, targets, 'name', fragment);

    var results = displayNameResults.concat(nameResults);

    if(results.length > 1) {
      socket.emit('output', {message: ambigiousMessage(results)});
    }
    
    if (results.length === 1) {
      const list = getTargetList(socket, results[0].target);
      return list.find(i => i[results[0].property] === results[0].matchedValue);
    } else {
      return null;
    }
  },

};