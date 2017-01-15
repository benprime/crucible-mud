var globals = require('./globals');
var actionsData = require('./actionData');

// generalized function again
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

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
    actionDispatcher: function(socket, action, username) {
      if (action in actionsData.actions) {

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

        var actionMessages = actionsData.actions[action];
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
