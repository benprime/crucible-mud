

export default {
  name: 'help',
  desc: 'help system',


  patterns: [
    /^help$/i,
    /^h$/i,
    /^\?$/,
    /^help\s+(\w+)$/i,
  ],

  parseParams(match) {
    if(match.length < 2) return;
    return [this.name, match[1]];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">help </span> <span class="purple">-</span> Display basic help for playing CrucibleMUD.<br />';
    output += '<span class="mediumOrchid">help commands</span> <span class="purple">-</span> Display list of available commands.<br />';
    output += '<span class="mediumOrchid">help &lt;command&gt</span> <span class="purple">-</span> Display detailed help for specified command.<br />';
    character.output(output);
  },
};
