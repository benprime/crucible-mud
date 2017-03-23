'use strict';

const actionsData = require('./data/actionData');
const globals = require('./globals');

module.exports = {
  actionDispatcher(socket, action, username) {
    if (action in actionsData.actions) {
      // user is attempting to action another user
      if (username) {
        let targetSocketId = globals.USERNAMES.getKeyByValue(username);
        if (!targetSocketId) {
          socket.emit('output', { message: `Unknown user: ${username}` });
          return true;
        }

        if (targetSocketId === socket.id) {
          // if a user has tried to do an action on himself, just ignore the passed argument
          username = null;
          targetSocketId = null;
          // socket.emit('output', { 'message': 'You cannot do actions on yourself.' });
          // return true;
        } else {
          // make sure the user is someone in the room
          const userInRoom = targetSocketId in global.io.sockets.adapter.rooms[socket.room._id].sockets;
          if (!userInRoom) {
            socket.emit('output', { message: `You don't see ${username} anywhere!` });
            return true;
          }
        }
      }

      const actionMessages = actionsData.actions[action];
      const messages = username ? actionMessages.target : actionMessages.solo;
      const targetSocket = username ? globals.GetSocketByUsername(global.io, username) : null;

      const fromUser = globals.USERNAMES[socket.id];
      const toUser = targetSocket ? globals.USERNAMES[targetSocket.id] : null;

      if (messages.sourceMessage) {
        socket.emit('output', { message: messages.sourceMessage.format(fromUser, toUser) });
      }

      if (messages.roomMessage) {
        const room = global.io.sockets.adapter.rooms[socket.room._id];

        

        Object.keys(room.sockets).forEach((socketId) => {
          // if you have a sourceMessage, don't send room message to source socket
          if (messages.sourceMessage && socketId === socket.id) {
            return;
          }

          // not to target user's socket
          if (targetSocket && messages.targetMessage && socketId === targetSocket.id) {
            return;
          }
          global.io.to(socketId).emit('output', { message: messages.roomMessage.format(fromUser, toUser) });
        });
      }

      if (targetSocket && messages.targetMessage) {
        targetSocket.emit('output', { message: messages.targetMessage.format(fromUser, toUser) });
      }
      return true;
    }
    return false;
  },
};
