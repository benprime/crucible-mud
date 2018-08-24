import socketUtil from '../core/socketUtil';
export default {
  name: 'break',

  patterns: [
    /^br$/i,
    /^break$/i,
  ],

  dispatch(socket) {
    this.execute(socket.character)
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character) {

    const charMessages = [];
    const roomMessages = [];

    if(character.attackTarget) {
      charMessages.push({ charId: character.id, message: '<span class="olive">*** Combat Disengaged ***</span>' });
      roomMessages.push({ roomId: character.roomId, message: `${character.name} breaks off his attack.`, exclude: [character.id] });
    }

    character.break();

    return Promise.resolve({
      charMessages: charMessages,
      roomMessages: roomMessages,
    });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">break <span class="purple">|</span> br</span> <span class="purple">-</span> End combat.<br />';
    socket.emit('output', { message: output });
  },

};
