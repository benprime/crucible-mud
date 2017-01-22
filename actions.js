var actionsData = require('./data/actionData');
var globals = require('./globals');

module.exports = function(io) {
  return {
    actionDispatcher: function(socket, action, username) {
      if (action in actionsData.actions) {

        // user is attempting to action another user
        if (username) {
          var targetSocketId = globals.USERNAMES.getKeyByValue(username);
          if (!targetSocketId) {
            socket.emit('output', { 'message': 'Unknown user: ' + username });
            return true;
          }

          if (targetSocketId == socket.id) {
            // if a user has tried to do an action on himself, just ignore the passed argument
            username = null;
            targetSocketId = null;
            //socket.emit('output', { 'message': 'You cannot do actions on yourself.' });
            //return true;
          } else {
          	// make sure the user is someone in the room
            var userInRoom = targetSocketId in io.sockets.adapter.rooms[socket.room._id].sockets;
            if (!userInRoom) {
              socket.emit('output', { 'message': 'You don\'t see ' + username + ' anywhere!' });
              return true;
            }
          }
        }

        var actionMessages = actionsData.actions[action];
        var messages = username ? actionMessages['target'] : actionMessages['solo'];
        var targetSocket = username ? globals.GetSocketByUsername(io, username) : null;

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
