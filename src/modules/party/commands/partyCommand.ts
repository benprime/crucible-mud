

export default {
  name: 'party',
  desc: 'list the members of your current party',

  
  patterns: [
    /^party$/i,
    /^par$/i,
  ],

  parseParams() {
    return {actionName: this.name, actionParams: []};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">party</span> <span class="purple">-</span> Display list of party members.<br />';
    character.output(output);
  },
};
