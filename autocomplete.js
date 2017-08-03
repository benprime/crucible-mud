'use strict';

const roomManager = require('./roomManager');

/* auto complete with a starts with */
function filterMatch(array, pattern) {
  const re = new RegExp(`^${pattern}`, 'i');
  const matches = array.filter(value => !!re.exec(value));

  // return unique matches only
  return matches.filter((item, i, matches) => matches.indexOf(item) === i);
}

function getTargetNames(socket, room, property, target) {
  switch (target) {
    case 'mob':
      return room.mobs.map(mob => mob[property]).distinct();
    case 'inventory':
      return socket.user.inventory.map(item => item[property]).distinct();
    case 'key':
      return socket.user.keys.map(key => key[property]).distinct();
    case 'room':
      return room.inventory.map(item => item[property]).distinct();
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

function returnObject(socket, room, property, results) {
  var name = results[0].name;
  var target = results[0].target;

  switch (target) {
    case 'mob':
      return room.mobs.find(mob => mob[property] === name);
    case 'inventory':
      return socket.user.inventory.find(item => item[property] === name);
    case 'key':
      return socket.user.keys.find(key => key[property] === name);
    case 'room':
      return room.inventory.find(item => item[property] === name);
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

function autocompleteByProperty(socket, targets, property, fragment) {
  let results = [];

  const room = roomManager.getRoomById(socket.user.roomId);

  targets.forEach(target => {
    const names = getTargetNames(socket, room, property, target);
    var matches = filterMatch(names, fragment);
    if (matches.length > 0) {
      Array.prototype.push.apply(results, matches.map(matchedString => { return { target: target, name: matchedString }; }));
    }
  });

  // returns object (item or mob) matched
  if (results.length === 1) {
    return returnObject(socket, room, property, results);
  }

  return null;
}

module.exports = {
  autocomplete(socket, targets, fragment) {
    const displayNameObj = autocompleteByProperty(socket, targets, 'displayName', fragment);
    const nameObj = autocompleteByProperty(socket, targets, 'name', fragment);

    // todo: we need to have this command list all the ambigious matches
    if (displayNameObj && nameObj) {
      return null;
    }
    else {
      return displayNameObj || nameObj;
    }
  },

};