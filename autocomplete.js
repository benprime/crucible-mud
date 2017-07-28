'use strict';

const roomManager = require('./roomManager');

/* auto complete with a starts with */
function filterMatch(array, pattern) {
  const re = new RegExp(`^${pattern}`, 'i');
  const matches = array.filter(value => !!re.exec(value));

  // return unique matches only
  return matches.filter((item, i, matches) => matches.indexOf(item) === i);
}

function getTargetNames(socket, room, target) {
  switch (target) {
    case 'mob':
      return room.mobs.map(mob => mob.displayName);
    case 'inventory':
      return socket.user.inventory.map(item => item.displayName);
    case 'key':
      return socket.user.keys.map(key => key.displayName);
    case 'room':
      return room.inventory.map(item => item.displayName);
    case 'player':
      return global.UsersInRoom(room.id).filter(name => name !== socket.user.username);
      /*
    case 'offer':
      return global.offers
      .filter(offer => offer.toUserName.toLowerCase() === socket.user.username.toLowerCase())
      .map(offer => offer.item.displayName);
      */
    default:
      return [];
  }
}

function returnObject(socket, room, results) {
  var name = results[0].name;
  var target = results[0].target;

  // refactor this into several methods
  switch (target) {
    case 'mob':
      return room.mobs.find(mob => mob.displayName === name);
    case 'inventory':
      return socket.user.inventory.find(item => item.displayName === name);
    case 'key':
      return socket.user.keys.find(key => key.displayName === name);
    case 'room':
      return room.inventory.find(item => item.displayName === name);
      /*
    case 'offer':
      return global
      .filter(offer => offer.toUserName.toLowerCase() === socket.user.username.toLowerCase())
      .find(offer => offer.item.displayName === name).item;
      */
    case 'player':
      return global.GetSocketByUsername(name);
    default:
      return [];
  }
}

module.exports = {
  autocomplete(socket, targets, fragment, remove) {
    let results = [];

    const room = roomManager.getRoomById(socket.user.roomId);

    targets.forEach(target => {
      const names = getTargetNames(socket, room, target);
      var matches = filterMatch(names, fragment);
      if (matches.length > 0) {
        Array.prototype.push.apply(results, matches.map(displayName => { return { target: target, name: displayName }; }));
      }
    });

    // returns object (item or mob) matched
    if(results.length === 1) {
      return returnObject(socket, room, results, remove);
    }

    return null;
  },

};