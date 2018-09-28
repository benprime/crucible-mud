import commandCategories from '../../../core/commandCategories';

export default {
  name: 'sneak',
  desc: 'Activates stealthy movement.',
  category: commandCategories.stealth,

  patterns: [
    /^sneak$/i,
    /^sn$/i,
  ],

  parseParams() {
    return [this.name];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">sneak</span><span class="purple">-</span> Activates a sneak bonus for the following stealth-based commands: move<br />';
    character.output(output);
  },

};
