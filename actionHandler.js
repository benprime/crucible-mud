'use strict';

const actionsData = require('./data/actionData');

module.exports = {
  actionDispatcher(socket, action, username) {
    const targetSocket = username ? global.GetSocketByUsername(username) : null;
    console.log("targetSocket", targetSocket);

    if (action in actionsData.actions) {
      // user is attempting to action another user
      if (username) {
        if (!targetSocket) {
          socket.emit('output', { message: `Unknown user: ${username}` });
          return true;
        }

        if (targetSocket.id === socket.id) {
          // if a user has tried to do an action on himself, just ignore the passed argument
          username = null;
        } else {
          // make sure the user is someone in the room
          const userInRoom = global.UserInRoom(socket.user.roomId, username);
          if (!userInRoom) {
            socket.emit('output', { message: `You don't see ${username} anywhere!` });
            return true;
          }
        }
      }

      const actionMessages = actionsData.actions[action];
      const messages = username ? actionMessages.target : actionMessages.solo;

      const fromUser = socket.user.username;
      const toUser = targetSocket ? targetSocket.user.username : null;

      if (messages.sourceMessage) {
        socket.emit('output', { message: messages.sourceMessage.format(fromUser, toUser) });
      }

      if (messages.roomMessage) {
        const room = global.io.sockets.adapter.rooms[socket.user.roomId];

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
