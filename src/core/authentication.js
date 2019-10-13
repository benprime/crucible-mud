import socketUtil from './socketUtil';
import hud from './hud';
import Room from '../models/room';
import Character from '../models/character';
import characterStates from './characterStates';
import jwt from 'jsonwebtoken';
import config from '../config';

// TODO: tokens should expire out of the cache.
// add config value to use for both token expiration and cache expiration.
export const tokenCache = {};

exports.addUserToRealm = (socket, userId) => {
  return Character.findByUserId(userId).populate('user').then(character => {
    if (!character) {
      return Promise.reject('No character associated with this user.');
    }

    // if the user is logged in from another connection, disconnect it.
    const existingSocket = socketUtil.getSocketByCharacterId(character.id);
    if (existingSocket) {
      existingSocket.emit('output', { message: 'You have logged in from another session.\n<span class="gray">*** Disconnected ***</span>' });
      existingSocket.disconnect();
    }

    // database objects
    socket.character = character;
    //socket.character.user = user;

    // state tracking
    socket.character.offers = [];
    //socket.character.sneakMode = 0;
    socket.character.attackInterval = undefined;
    socket.character.lastAttack = undefined;
    socket.character.attackTarget = undefined;
    socket.character.leader = null;
    socket.character.partyInvites = [];
    socket.character.dragging = false;
    socket.character.states = [];

    // once character is loaded, we freeze the ability to add new properties.
    // this forces "state properties" to be added here, explicitly.
    Object.preventExtensions(socket.character);

    // format the subdocuments so we have actual object instances
    // Note: tried a lean() query here, but that also stripped away the model
    // instance methods.
    // TODO: is this still necessary?
    const objInventory = socket.character.inventory.map(i => i.toObject());
    socket.character.inventory = objInventory;

    socket.join('realm');
    socket.broadcast.to('realm').emit('output', { message: `<span class="mediumOrchid">${character.name} has entered the realm.</span>\n` });

    socket.join('gossip');

    hud.updateHUD(socket);

    character.setupEvents();

    if (character.currentHP <= 0) {
      character.setState(characterStates.INCAPACITATED);
    }

    const currentRoom = Room.getById(character.roomId);
    if (currentRoom) {
      socket.join(character.roomId);
      currentRoom.characters.push(character);
      const roomDesc = currentRoom.getDesc(character, false);
      character.output(roomDesc);
    } else {
      const room = Room.getByCoords({ x: 0, y: 0, z: 0 });
      character.roomId = room.id;
      if(!room.characters) room.characters = [];
      room.characters.push(character);
      socket.join(room.id);
      const roomDesc = room.getDesc(character, false);
      character.output(roomDesc);
    }
  });
};

exports.verifyToken = (token) => {
  if (!token) return false;
  if (!(token in tokenCache)) return false;

  try {
    return jwt.verify(token, config.TOKEN_SECRET);
  } catch (e) {
    // delete expired tokens
    if (token in tokenCache) {
      delete tokenCache[token];
    }
    console.log(e);
    return false;
  }
};

exports.logout = (socket) => {
  delete tokenCache[socket.token];
};