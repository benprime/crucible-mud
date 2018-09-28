import commandCategories from '../../../core/commandCategories';

export default {
  name: 'say',
  desc: 'communicate with players in the current room',
  category: commandCategories.communication,

  patterns: [
    /^\.(.+)/,
    /^say\s+(.+)/i,
  ],

  parseParams(match) {
    return [this.name, match[1]];
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">say command </span><span class="darkcyan">-</span> Speak to users in current room.<br>';
    output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Start a command with . to say to users.<br />';
    character.output(output);
  },
};
