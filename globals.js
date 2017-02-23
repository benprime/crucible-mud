'use strict';

if (!String.prototype.format) {
  String.prototype.format = function () {
    const args = arguments;
    return this.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined') ? args[number] : match);
  };
}

if (!Object.prototype.getKeyByValue) {
  Object.defineProperty(Object.prototype, 'getKeyByValue', {
    value(value) {
      for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
          if (this[prop] === value) { return prop; }
        }
      }
    },
    enumerable: false,
  });
}

if (!Array.prototype.GetFirstByName) {
  Array.prototype.GetFirstByName = function (name) {
    const item = this.find(i => i.name.toLowerCase() === name.toLowerCase());
    return item;
  };
}

module.exports = {
  STATES: {
    LOGIN_USERNAME: 0,
    LOGIN_PASSWORD: 1,
    MUD: 2,
  },

  USERNAMES: {},
  DB: {},
  MOBS: {},
  FilterMatch: (array, pattern) => {
    const re = new RegExp(`^${pattern}`, 'i');
    return array.filter(value => !!re.exec(value));
  },
  ResolveName: (socket, nameString, list) => {
    const name = nameString.trim().toLowerCase();
    //console.log("nameString", nameString);

    //console.log("list", JSON.stringify(list));
    // (if there are two or more of the same creature, we just pick the first one)
    const uniqueMobNameList = list.filter((item, i, list) => list.indexOf(item) === i);
    //console.log("uniqueMobNameList", JSON.stringify(uniqueMobNameList));
    const filteredNames = module.exports.FilterMatch(uniqueMobNameList, name);
    //console.log("filteredNames", JSON.stringify(filteredNames));

    if (filteredNames.length > 1) {
      socket.emit('output', { message: 'Not specific enough!' });
      return null;
    } else if (filteredNames.length === 0) {
      socket.emit('output', { message: 'You don\'t see that here!' });
      return null;
    }
    // got it
    return filteredNames[0];
  },
  GetSocketByUsername: (io, username) => {
    const socketId = module.exports.USERNAMES.getKeyByValue(username);
    return io.sockets.connected[socketId];
  },
};
