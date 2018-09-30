import Room from '../../../models/room';
import socketUtil from '../../../core/socketUtil';
import { getDirection, Direction } from '../../../core/directions';

export default {
  name: 'move',
  execute(character, dir) {
    moveCharacter(character, dir);
    // only leave your party on a successful move
    character.leader = null;
    const room = Room.getById(character.roomId);
    character.action('look', false, room);
  },
};

const moveCharacter = function (character, dir) {

  // const fromRoom = Room.getById(character.roomId);
  const socket = socketUtil.getSocketByCharacterId(character.id);

  const exit = IsExitPassable(character, dir);
  if (!exit) {
    return;
  }
  const toRoom = Room.getById(exit.roomId);
  character.break();

  if (socket) {
    if (character.isIncapacitated()) character.output(`You are dragged ${dir.long}...`);
    else if (character.sneakMode()) character.output(`You sneak ${dir.long}...`);
    else character.output(`You move ${dir.long}...`);
  }

  leave(character, dir, socket);
  enter(character, dir.opposite, socket);

  let followers = socketUtil.getFollowers(socket.character.id);
  if (character.dragging) {
    const drag = socketUtil.getCharacterById(character.dragging);
    followers.push(drag);
  }

  followers.forEach(c => {
    c.move(dir);
  });

  return toRoom;
};

//============================================================================
// Helper methods for socket output, these will likely be moved.
//============================================================================
const sendHitWallMessage = function (character, dir) {
  let message = '';
  const socket = socketUtil.getSocketByCharacterId(character.id);

  // send message to everyone in current room that player is running into stuff.
  if (dir.short === 'u') {
    message = `${character.name} runs into the ceiling.`;
  } else if (dir.short === 'd') {
    message = `${character.name} runs into the floor.`;
  } else {
    message = `${character.name} runs into the wall to the ${dir.long}.`;
  }
  socket.broadcast.to(socket.character.roomId).emit('output', { message: `<span class="silver">${message}</span>` });
  socket.emit('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
};

const sendHitDoorMessage = function (character, dir) {
  let message = '';

  // send message to everyone in current room that player is running into stuff.
  if (dir.short === 'u') {
    message = `${character.name} runs into the closed door above.`;
  } else if (dir.short === 'd') {
    message = `${character.name} runs into the trapdoor on the floor.`;
  } else {
    message = `${character.name} runs into the door to the ${dir.long}.`;
  }
  character.toRoom(`<span class="silver">${message}</span>`);
  character.output('<span class="yellow">The door in that direction is not open!</span>');
};

// emits "You hear movement to the <dir>" to all adjacent rooms
const sendMovementSoundsMessage = function (excludeDir) {

  // fromRoomId is your current room (before move)
  for (let exit of this.exits) {
    if (excludeDir && exit.dir === excludeDir) {
      continue;
    }

    let dir = getDirection(exit.dir);
    const message = `You hear movement ${dir.opposite.desc}.`;
    global.io.to(exit.roomId).emit('output', { message });
  }
};

const getLeftMessages = function (dir, charName) {
  let output = '';
  if (dir.short === 'u') {
    output = `${charName} has gone above.`;
  } else if (dir.short === 'd') {
    output = `${charName} has gone below.`;
  } else {
    output = `${charName} has left to the ${dir.long}.`;
  }
  return `<span class="yellow">${output}</span>`;
};

const getEnteredMessage = function (dir, charName) {
  let output = '';
  if (dir.short === 'u') {
    output = `${charName} has entered from below.`;
  } else if (dir.short === 'd') {
    output = `${charName} has entered from above.`;
  } else {
    output = `${charName} has entered from the ${dir.long}.`;
  }
  return `<span class="yellow">${output}</span>`;
};




// todo: This may need a more descriptive name, it is for "leaving by exit"
// it updates games state, generates messages
const leave = function (character, dir, socket) {
  const exclude = socket ? [socket.id] : [];

  if (character.roomId !== this.id) {
    // TODO: investigate this. This is only possible because of data duplication that we
    // may be able to get rid of.
    throw 'Character leave was called when the character was not assigned the room';
  }

  if (!character.sneakMode()) {
    sendMovementSoundsMessage(dir.short);
  }

  // if this is a player
  if (socket) {
    // unsubscribe from Socket.IO room
    socket.leave(this.id);
  }

  // whenever you leave a room, you leave tracks (for tracking command and scripting options)
  this.tracks[character.id] = {
    dir: dir.short,
    timestamp: new Date().getTime(),
  };

  // leaving room message
  if (!character.sneakMode()) {
    const msg = getLeftMessages(dir, character.name);
    socketUtil.roomMessage(this.id, msg, exclude);
  }
};

// todo: This may need a more descriptive name, it is for "entering by exit"
// it updates games state, generates messages
const enter = function (character, dir, socket) {
  const currentRoom = Room.getById(character.roomId);
  const exit = currentRoom.getExit(dir.short);
  const targetRoom = Room.getById(exit.roomId);

  character.roomId = targetRoom.id;

  if (!character.sneakMode()) {
    const exclude = socket ? [socket.id] : [];
    const msg = getEnteredMessage(dir, character.name);
    socketUtil.roomMessage(character.roomId, msg, exclude);

    if (dir) {
      targetRoom.sendMovementSoundsMessage(dir.short);
    }
  }

  character.save(err => { if (err) throw err; });
  if (socket) {
    socket.join(this.id);
  }

};

const IsExitPassable = function (character, dir) {
  if (!(dir instanceof Direction)) {
    character.output('dir parameter must be a direction');
    return false;
  }

  // validate direction is valid
  if (!dir) {
    character.output('<span class="yellow">That is not a valid direction!</span>');
    return false;
  }

  const exit = this.exits.find(e => e.dir === dir.short);
  if (!exit) {
    sendHitWallMessage(character, dir.short);
    return false;
  }

  // custom scripting exit disabler
  if (exit.disabledMessage) {
    character.output(`<span class="yellow">${exit.disabledMessage}</span>`);
    return false;
  }

  // general public cannot enter hidden rooms.
  // admin can enter a hidden room, even if it is not revealed.
  // if (exit.hidden && !character.user.admin) {
  //   const msg = GetHitWallMessage(character, dir);
  //   roomMessages.push({roomId: this.id, message: msg});
  //   return Promise.reject();
  // }

  if (exit.closed) {
    sendHitDoorMessage(character, dir.short);
    return false;
  }

  return exit;
};

