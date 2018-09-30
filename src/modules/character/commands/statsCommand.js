export default {
  name: 'stats',
  desc: 'view your character status and abilities',

  patterns: [
    /^stats$/i,
    /^stat$/i,
  ],

  parseParams(match) {
    if(match.length > 1) return false;
    return [this.name];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">stats </span><span class="purple">-</span> Display current character stats.<br />';
    character.output(output);
  },
};
