'use strict';

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

/* validate found objects and prints error messages */
function validateFoundObjects(socket, results) {

  if (results.length === 0) {
    socket.emit('output', { message: 'You don\'t see that here!' });
    return false;
  } else if (results.length > 1) {
    /* todo: possibly list these by type */
    socket.emit('output', { message: 'Which did you mean?\n' + results.map(r => r.name).join('\n') });
    return false;
  } else {
    return true;
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
  autocomplete(socket, room, targets, fragment, remove) {
    let results = [];

    targets.forEach(target => {
      const names = getTargetNames(socket, room, target);
      var matches = filterMatch(names, fragment);
      if (matches.length > 0) {
        Array.prototype.push.apply(results, matches.map(displayName => { return { target: target, name: displayName }; }));
      }
    });

    // verifies only one object was found, prints error messages otherwise
    if (!validateFoundObjects(socket, results)) {
      return;
    }

    // returns object (item or mob) matched
    return returnObject(socket, room, results, remove);
  },

};