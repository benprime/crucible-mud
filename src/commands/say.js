import commandCategories from '../core/commandCategories';

export default {
  name: 'say',
  desc: 'communicate with players in the current room',
  category: commandCategories.communication,

  patterns: [
    /^\.(.+)/,
    /^say\s+(.+)/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1]);
  },

  execute(character, message) {
    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    character.output(`You say "<span class="silver">${safeMessage}</span>"`);
    character.toRoom(`${character.name} says "<span class="silver">${safeMessage}</span>"`, [character.id]);
    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">say command </span><span class="darkcyan">-</span> Speak to users in current room.<br>';
    output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Start a command with . to say to users.<br />';
    character.output(output);
  },
};
