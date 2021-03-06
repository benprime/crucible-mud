export default {
  name: 'keys',
  desc: 'list the keys your are currently carrying',
  
  patterns: [
    /^keys$/i,
  ],

  parseParams(match) {
    if(match.length > 1) return false;
    return {actionName: this.name, actionParams: []};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">keys </span><span class="purple">-</span> Display keys on your key ring.<br />';
    character.output(output);
  },
};
