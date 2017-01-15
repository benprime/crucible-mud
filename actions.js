var globals = require('./globals');

// generalized function again
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

// this might go in the database later to be managed by admins
// todo: are there any targetted actions that are not allowed? I don't think so.
// rules: message goes to socket taking action, roomMessage goes to everyone else, targetMessage goes to target
var actions = {
  "dance": {
    "solo": {
      "roomMessage": "{0} dances a little jig!",
      "sourceMessage": "You dance a little jig!"
    },
    "target": {
      "targetMessage": "{0} dances with you around the room!",
      "roomMessage": "{0} dances with {1} around the room!",
      "sourceMessage": "You dance with {1} around the room!"
    }
  },
  "kiss": {
    "solo": {
      "sourceMessage": "Who do you want to kiss?"
    },
    "target": {
      "targetMessage": "{0} kisses you passionalety!",
      "roomMessage": "{0} kisses {1} passionately!",
      "sourceMessage": "You kiss {1} passionately!"
    }
  },
  "slap": {
    "solo": {
      "sourceMessage": "Who or what do you want to slap?"
    },
    "target": {
      "targetMessage": "{0} slaps you across the face!",
      "roomMessage": "{0} slaps {1} across the face!",
      "sourceMessage": "You slap {1} across the face!"
    }
  },
  "whistle": {
    "solo": {
      "sourceMessage": "You whistle a little tune.",
      "roomMessage": "{0} whistles a little tune."
    },
    "target": {
      "targetMessage": "{0} whistles at you.",
      "roomMessage": "{0} whistles at {1}.",
      "sourceMessage": "You whistle at {1}."
    }
  }
};

module.exports = function(io) {
  // duplicate function from elsewhere
  function getKeyByValue(obj, value) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (obj[prop] === value)
          return prop;
      }
    }
  }

  function GetSocketByUsername(username) {
    var socketId = getKeyByValue(globals.USERNAMES, username);
    return io.sockets.connected[socketId];
  }

  return {
    actions: actions,
    actionDispatcher: function(socket, action, username) {
      if (action in actions) {

        // user is attempting to action another user
        if (username) {
          var targetSocketId = getKeyByValue(globals.USERNAMES, username);
          if (!targetSocketId) {
            socket.emit('output', { 'message': 'Unknown user: ' + username });
            return true;
          }

          if (targetSocketId == socket.id) {
            socket.emit('output', { 'message': 'You cannot do actions on yourself.' });
            return true;
          }


          var userInRoom = targetSocketId in io.sockets.adapter.rooms[socket.room._id].sockets;
          if (!userInRoom) {
            socket.emit('output', { 'message': 'You don\'t see ' + username + ' anywhere!' });
            return true;
          }
        }
        var actionMessages = actions[action];
        var messages = username ? actionMessages['target'] : actionMessages['solo'];
        var targetSocket = username ? GetSocketByUsername(username) : null;

        var fromUser = globals.USERNAMES[socket.id];
        var toUser = targetSocket ? globals.USERNAMES[targetSocket.id] : null;

        if (messages.sourceMessage) {
          socket.emit('output', { 'message': messages.sourceMessage.format(fromUser, toUser) });
        }

        if (messages.roomMessage) {
          var room = io.sockets.adapter.rooms[socket.room._id];

          for (socketId in room.sockets) {
            // if you have a sourceMessage, don't send room message to source socket
            if (messages.sourceMessage && socketId == socket.id) {
              continue;
            }

            // not to target user's socket
            if (targetSocket && messages.targetMessage && socketId == targetSocket.id) {
              continue;
            }
            io.to(socketId).emit('output', { 'message': messages.roomMessage.format(fromUser, toUser) });
          }

          // if this action has a target specific message, don't send to target
          /*
          if (targetSocket && messages.targetMessage) {
            var recipients = recipients.except(targetSocket.id);
          }

          recipients.emit('output', { 'message': messages.roomMessage.format(fromUser, toUser) });
          */
        }

        if (targetSocket && messages.targetMessage) {
          targetSocket.emit('output', { 'message': messages.targetMessage.format(fromUser, toUser) });
        }
        return true;
      }
      return false;
    }
  }
}
