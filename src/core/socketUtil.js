export default {
  // used by mob prototype
  socketInRoom(roomId, socketId) {
    const ioRoom = global.io.sockets.adapter.rooms[roomId];
    return !!(ioRoom && socketId in ioRoom.sockets);
  },

  // method for sending a message to all players in a room, except one.
  // using the receiver's socket instead of relying on the "sender" socket.
  roomMessage(roomId, message, exclude) {
    const ioRoom = global.io.sockets.adapter.rooms[roomId];
    if (!ioRoom) return;
    for (let socket of Object.values(ioRoom.sockets)) {
      if (Array.isArray(exclude) && exclude.includes(socket.id)) continue;
      if (!socket) continue;
      socket.emit('output', { message });
    }
  },

  getSocketByUsername(username) {
    for (let socket of Object.values(global.io.sockets.connected)) {
      if (socket.user && socket.user.username.toLowerCase() == username.toLowerCase()) {
        return socket;
      }
    }
    return null;
  },

  getSocketByUserId(userId) {
    for (let socket of Object.values(global.io.sockets.connected)) {
      if (socket.user && socket.user.id == userId) {
        return socket;
      }
    }
    return null;
  },

  getFollowingSockets(userId) {
    const followingSockets = [];
    for (let socket of Object.values(global.io.sockets.connected)) {
      if (socket.user && socket.leader === userId) {
        followingSockets.push(socket);
      }
    }
    return followingSockets;
  },

  getSocket(socketId) {
    return global.io.sockets.connected[socketId];
  },

  getRoomSockets(roomId) {
    const ioRoom = global.io.sockets.adapter.rooms[roomId];
    if (!ioRoom) return [];
    return Object.keys(ioRoom.sockets).map((socketId) => global.io.sockets.connected[socketId]);
  },

  // method for validating a valid username and that the user is in the current room
  validUserInRoom(socket, username) {
    const userSocket = this.getSocketByUsername(username);
    if (!userSocket) {
      socket.emit('output', { message: 'Unknown user' });
      return false;
    }

    if (!this.socketInRoom(socket.user.roomId, userSocket.id)) {
      socket.emit('output', { message: `You don't see ${username} here.` });
      return false;
    }

    return userSocket;
  },
};




