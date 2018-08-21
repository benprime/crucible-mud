import Room from '../models/room';
import socketUtil from '../core/socketUtil';

export default {
  name: 'yell',

  patterns: [
    /^"(.+)"?/,
    /^yell\s+(.+)/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, message) {

    const room = Room.getById(character.roomId);

    const roomMessages = [];

    // send message to all adjacent exits
    room.exits.forEach(exit => {
      let preMsg = '';
      if (exit.dir === 'u') {
        preMsg = 'Someone yells from below ';
      } else if (exit.dir === 'd') {
        preMsg = 'Someone yells from above ';
      } else {
        preMsg = `Someone yells from the ${Room.shortToLong(Room.oppositeDirection(exit.dir))} `;
      }
      const surroundMsg = `${preMsg} '${message}'`;
      roomMessages.push({ roomId: exit.roomId, message: surroundMsg });
    });

    roomMessages.push({ roomId: room.id, message: `${character.name} yells '${message}'` });
    const charMessages = [{ charId: character.id, message: `You yell '${message}'` }];

    return Promise.resolve({
      roomMessages: roomMessages,
      charMessages: charMessages,
    });
  },

  help(socket) {
    let output = '';
    output += '<span class="cyan">yell command</span><br/>';
    output += '<span class="mediumOrchid">"<message></span> <span class="purple">-</span> Yell to this room and all adjacent rooms.<br />';
    socket.emit('output', { message: output });
  },
};
