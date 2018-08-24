import socketUtil from '../core/socketUtil';

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

  sendMessages(socket, output) {
    if(!output) return;
    if (typeof output === 'string' || output instanceof String) {
      socket.emit('output', { message: output });
    }
    else {
      if (Array.isArray(output.charMessages) && output.charMessages.length > 0) {
        for (let msg of output.charMessages) {
          let charSocket = this.getSocketByCharacterId(msg.charId);
          if (!charSocket) continue;
          charSocket.emit('output', { message: msg.message });
        }
      }

      if (Array.isArray(output.roomMessages) && output.roomMessages.length > 0) {
        for (let msg of output.roomMessages) {

          // if there is only one character to exlude, use Socket.IO's
          // built-in broadcast functionality.
          // TODO: review this. Is it a good idea to broadcast from a
          // player socket? What if they disconnect mid-processing?
          if (Array.isArray(msg.exclude) && msg.exclude.length === 1) {
            const charSocket = socketUtil.getSocketByCharacterId(msg.exclude[0]);
            if (!charSocket) throw 'Invalid character id';
            charSocket.to(msg.roomId).emit('output', { message: msg.message });
          }
          // if there are multiple characters being excluded,
          // loop through the room sockets manually.
          else if (Array.isArray(msg.exclude) && msg.exclude.length > 0) {
            const socketRoom = global.io.sockets.adapter.rooms[msg.roomId];
            for (let socketId of Object.keys(socketRoom.sockets)) {
              let charSocket = global.io.sockets.connected[socketId];
              if (msg.exclude.includes(charSocket.character.id)) continue;
              charSocket.emit('output', { message: msg.message });
            }
          } else {
            global.io.to(msg.roomId).emit('output', { message: msg.message });
          }
        }
      }
    }
  },

  output(socket, output) {
    socket.emit('output', { message: output });
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
      if (socket.user && socket.character.id === characterId) {
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




