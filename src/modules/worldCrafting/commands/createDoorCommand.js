

export default {
  name: 'create door',
  desc: 'creates a door on an existing exit',

  admin: true,

  patterns: [
    /^create\s+door\s+(\w+)$/i,
  ],

  parseParams(match) {
    if (match.length != 2) return false;
    return {actionName: this.name, actionParams: [match[1]]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create door </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
