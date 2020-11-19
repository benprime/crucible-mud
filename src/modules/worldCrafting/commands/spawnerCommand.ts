export default {
  name: 'spawner',
  desc: 'create and set mob spawner in the current room',

  admin: true,

  patterns: [
    /^spawner$/i,
    /^spawner\s+(add)\s+(.+)$/i,
    /^spawner\s+(remove)\s+(.+)$/i,
    /^spawner\s+(max)\s+(\d+)$/i,
    /^spawner\s+(timeout)\s+(\d+)$/i,
    /^spawner\s+(clear)$/i,
    /^spawner\s+(copy)$/i,
    /^spawner\s+(paste)$/i,
    /^spawner$/i,
  ],

  parseParams(match) {
    return {actionName: this.name, actionParams: [match[1], match[2]]};
  },

  help(character) {
    let output = '<span class="mediumOrchid">spawner </span><span class="purple">-</span> Show spawner settings for current room.<br />';
    output += '<span class="mediumOrchid">spawner add &lt;mob type&gt; </span><span class="purple">-</span> Add creature to the current room\'s spawner.<br />';
    output += '<span class="mediumOrchid">spawner remove &lt;mob type&gt; </span><span class="purple">-</span> Remove a creature from the current room\'s spawner.<br />';
    output += '<span class="mediumOrchid">spawner max &lt;count&gt; </span><span class="purple">-</span> Set max number of creatures for this room.<br />';
    output += '<span class="mediumOrchid">spawner timeout &lt;milleseconds&gt; </span><span class="purple">-</span> Set timeout from creature death until next spawn.<br />';
    output += '<span class="mediumOrchid">spawner clear </span><span class="purple">-</span> Clear all spawner settings for this room.<br />';
    output += '<span class="mediumOrchid">spawner copy </span><span class="purple">-</span> Copy the current room\'s spawner settings.<br />';
    output += '<span class="mediumOrchid">spawner paste </span><span class="purple">-</span> Paste a room\'s spawner settings.<br />';
    character.output(output);
  },
};
