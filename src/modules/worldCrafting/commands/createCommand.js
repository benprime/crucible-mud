

export default {
  name: 'create',
  desc: 'create a room or door',

  admin: true,

  patterns: [
    /^create\s+.*$/i,
    /^create$/i,
  ],

  parseParams() {
    return false;
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    output += '<span class="mediumOrchid">create door </span><span class="purple">-</span> Create a door in a specified direction.<br />';
    output += '<span class="mediumOrchid">create area </span><span class="purple">-</span> Create geographical area that rooms can be assigned to.<br />';
    character.output(output);
  },

};
