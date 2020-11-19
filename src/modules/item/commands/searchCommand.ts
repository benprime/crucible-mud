

export default {
  name: 'search',
  desc: 'search the current room for hidden objects',


  patterns: [
    /^search$/i,
  ],

  parseParams() {
    return {actionName: this.name, actionParams: []};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">search</span><span class="purple">-</span> If successful, reveal any hidden items and/or exits.<br />';
    character.output(output);
  },

};
