export default {
  name: 'break',
  desc: 'break off combat',

  patterns: [
    /^br$/i,
    /^break$/i,
  ],

  parseParams() {
    return {actionName: this.name, actionParams: []};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">break <span class="purple">|</span> br</span> <span class="purple">-</span> End combat.<br />';
    character.output(output);
  },

};
