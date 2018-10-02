export default {
  name: 'stats',
  desc: 'display your current hit points and wounded level',
  
  patterns: [
    /^health$/i,
    /^hea$/i,
  ],

  parseParams(match) {
    if(match.length > 1) return false;
    return [this.name];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">health </span><span class="purple">-</span> Display your current health status.<br />';
    character.output(output);
  },
};
