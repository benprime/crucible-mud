import actionsData from '../data/actionData';
import socketUtil from '../core/socketUtil';
import Room from '../models/room';
import utils from '../core/utilities';

export default {
  actionDispatcher(socket, action, username) {

    // validate action
    if (!(action in actionsData.actions)) return false;

    // validate target user is connected
    const targetSocket = username ? socketUtil.getSocketByUsername(username) : socket;
    if (!targetSocket) {
      socket.emit('output', { message: 'Unknown user' });
      return true;
    }
    
    // make sure the user is someone in the room
    const selfAction = targetSocket.user.username === socket.user.username;
    if(!selfAction) {
      const room = Room.getById(socket.user.roomId);
      const userInRoom = room.userInRoom(targetSocket.user.username);
      if (!userInRoom) {
        socket.emit('output', { message: `You don't see ${username} anywhere!` });
        return true;
      }
    }

    // determine message set to use
    const actionMessages = actionsData.actions[action];
    const messages = selfAction ? actionMessages.solo: actionMessages.target;

    // format messages
    const fromUser = socket.user.username;
    const toUser = targetSocket ? targetSocket.user.username : null;

    // messages to action-taker
    if (messages.sourceMessage) {
      socket.emit('output', { message: utils.formatMessage(messages.sourceMessage, fromUser, toUser) });
    }

    // messages to all bystanders
    if (messages.roomMessage) {
      const socketRoom = global.io.sockets.adapter.rooms[socket.user.roomId];

      Object.keys(socketRoom.sockets).forEach((socketId) => {
        // if you have a sourceMessage, don't send "room message" to source socket
        if (messages.sourceMessage && socketId === socket.id) {
          return;
        }

        // not to target user's socket (since they have their own message)
        if (targetSocket && messages.targetMessage && socketId === targetSocket.id) {
          return;
        }
        global.io.to(socketId).emit('output', { message: utils.formatMessage(messages.roomMessage, fromUser, toUser) });
      });
    }

    // message to target user
    if (targetSocket && messages.targetMessage) {
      targetSocket.emit('output', { message: utils.formatMessage(messages.targetMessage, fromUser, toUser) });
    }
    return true;
  },
};
