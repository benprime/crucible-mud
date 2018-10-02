
export default {
  name: 'experience',
  desc: 'show you currency experience level',
  
  patterns: [
    /^experience$/i,
    /^exp$/i,
    /^xp$/i,
  ],

  parseParams(match) {
    if(match.length > 1) return false;
    return [this.name];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">exp </span><span class="purple">-</span> Shows current user experience points.<br />';
    character.output(output);
  },
};
