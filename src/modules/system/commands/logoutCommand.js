
export default {
  name: 'logout',
  desc: 'logout of game',

  action: null,

  patterns: [
    /^logout$/i,
  ],

  parseParams() {
    return [this.name];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">logout</span> <span class="purple">-</span> Logout of game.<br />';
    character.output(output);
  },
};
