if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

module.exports = {
  STATES: {
    LOGIN_USERNAME: 0,
    LOGIN_PASSWORD: 1,
    MUD: 2
  },

  USERNAMES: {},
  DB: {},
  MOBS: {},
  FilterMatch: function(array, pattern) {
    var re = new RegExp("^" + pattern, "i");
    return array.filter(function(value) {
      return !!re.exec(value);
    });
  },
  ResolveName: function(socket, name, types) {
    // todo: currently only "mob" is implemented for ResolveName
    if (!types) {
      types = ['mob', 'item']; // players to be added
    }
    name = name.trim().toLowerCase();

    // check mob
    if (types.indexOf('mob') > -1) {
      console.log("checking mobs.")
      var mobInRoom = module.exports.MOBS[socket.room._id] || [];
      var mobNames = mobInRoom.map(function(mob) {
        return mob.displayName;
      });

      console.log("List: " + JSON.stringify(mobNames));

      // for mob names, we make the array unique (if there are two or more of the same creature, we just pick the first one)
      var uniqueMobNameList = mobNames.filter(function(mob, i, list) {
        return list.indexOf(mob) === i;
      });

      console.log("List: " + JSON.stringify(uniqueMobNameList));

      var filteredNames = module.exports.FilterMatch(uniqueMobNameList, name);
      console.log("List: " + JSON.stringify(filteredNames));

      if (filteredNames.length > 1) {
        socket.emit("output", { message: "Not specific enough!" });
        return null;
      } else if (filteredNames.length == 0) {
        socket.emit("output", { message: "You don't see that here!" });
        return null;
      } else {
        // got it
        return filteredNames[0];
      }
    }


    if (!target) {
      socket.emit("output", { message: "You don't see that here!" });
      return;
    }
  }
}
