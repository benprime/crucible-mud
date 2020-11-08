export default {
  name: 'inventory',
  desc: 'list the items you are currently carrying',
  
  patterns: [
    /^i$/i,
    /^inv$/i,
    /^inventory$/i,
  ],

  parseParams(match) {
    if(match.length > 1) return false;
    return {actionName: this.name, actionParams: []};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">inventory </span><span class="purple">-</span> Display current inventory.<br />';
    character.output(output);
  },
};
