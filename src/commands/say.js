import socketUtil from '../core/socketUtil';
import { commandCategories } from '../core/commandManager';

export default {
  name: 'say',
  desc: 'communicate with players in the current room',
  category: commandCategories.communication,
  
  patterns: [
    /^\.(.+)/,
    /^say\s+(.+)/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, message) {
    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    return Promise.resolve({
      charMessages: [
        { charId: character.id, message: `You say "<span class="silver">${safeMessage}</span>"` },
      ],
      roomMessages: [
        { roomId: character.roomId, message: `${character.name} says "<span class="silver">${safeMessage}</span>"`, exclude: [character.id] },
      ],
    });
  },

  help(socket) {
    let output = '';
    output += '<span class="cyan">say command </span><span class="darkcyan">-</span> Speak to users in current room.<br>';
    output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Start a command with . to say to users.<br />';
    socket.emit('output', { message: output });
  },
};
