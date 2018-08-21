export default {
  roomMessage(roomId, message, exclude) {
    const ioRoom = global.io.sockets.adapter.rooms[roomId];
    if (!ioRoom) return;
    for (let socketId in ioRoom.sockets) {
      let socket = global.io.sockets.connected[socketId];
      if (Array.isArray(exclude) && exclude.includes(socket.id)) continue;
      if (!socket) continue;
      socket.emit('output', { message });
    }
  },

  sendMessages(socket, commandResult) {
    if (typeof commandResult === 'string' || commandResult instanceof String) {
      socket.emit('output', { message: commandResult });
    }
    else {
      if (Array.isArray(commandResult.charMessages)) {
        for (let msg of commandResult.charMessages) {
          let charSocket = this.getSocketByCharacterId(msg.charId);
          if (!charSocket) continue;
          charSocket.emit('output', { message: msg.message });
        }
      }

      if (Array.isArray(commandResult.roomMessages)) {
        for (let msg of commandResult.roomMessages) {
          global.io.to(socket.character.roomId).emit('output', { message: msg.message });
        }
      }
    }
  },

  output(socket, output) {
    socket.emit('output', { message: output });
  },

  getSocketByUsername(username) {
    for (let socket of Object.values(global.io.sockets.connected)) {
      if (socket.user && socket.character.name.toLowerCase() == username.toLowerCase()) {
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

  getSocketByCharacterId(characterId) {
    for (let socket of Object.values(global.io.sockets.connected)) {
      if (socket.user && socket.character.id == characterId) {
        return socket;
      }
    }
    return null;
  },

  // not sure this belongs here. We're trying to make is so that game code has no knowledge of sockets.
  // game code uses this all the time and has to include the socketUtil library to do it. Perhaps move this?
  getCharacterByName(name) {
    for (let socket of Object.values(global.io.sockets.connected)) {
      if (socket.user && socket.character.name == name) {
        return socket.character;
      }
    }
    return null;
  },

  getFollowingCharacters(characterId) {
    const followers = [];
    for (let socket of Object.values(global.io.sockets.connected)) {
      if (socket.character && socket.leader === characterId) {
        followers.push(socket);
      }
    }
    return followers;
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
  characterInRoom(roomId, name) {
    const character = this.getCharacterByName(name);
    if (!character) {
      return false;
    }

    if (character.roomId !== roomId) {
      return false;
    }

    return character;
  },


};




