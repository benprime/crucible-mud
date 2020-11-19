

export default {
  name: 'list',
  desc: 'list item available for purchase in a shop',


  patterns: [
    /^list$/i,
    /^ls$/i,
  ],

  parseParams() {
    return {actionName: this.name, actionParams: []};
  },

  help(character) {
    const output = '<span class="mediumOrchid">list </span><span class="purple">-</span> List store inventory.<br />';
    character.output(output);
  },
};
