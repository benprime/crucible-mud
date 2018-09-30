

export default {
  name: 'set',
  desc: 'set game object properties',

  admin: true,

  patterns: [
    /^set\s+(room)\s+(desc)\s+(.+)$/i,
    /^set\s+(room)\s+(name)\s+(.+)$/i,
    /^set\s+(room)\s+(alias)\s+(.+)$/i,
    /^set\s+(room)\s+(area)\s+(.+)$/i,
    /^set\s+(room)\s+(shop)$/i,
    /^set\s+(currency)\s+(\d+)$/i,
    /^set\s+(hp)\s+(\d+)$/i,
    /^set\s+(bleeding)\s+(\d+)$/i,
    /^set\s+(debug)\s+(on|off)$/i,

    /^set.*$/i,
    /^set$/i,
  ],

  parseParams(match) {
    if (match.length < 3) return false;
    return [this.name, match[1], match[2]];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">set room name &lt;new room name&gt; </span><span class="purple">-</span> Change name of current room.<br />';
    output += '<span class="mediumOrchid">set room desc &lt;new room desc&gt; </span><span class="purple">-</span> Change description of current room.<br />';
    output += '<span class="mediumOrchid">set room alias &lt;new room alias&gt; </span><span class="purple">-</span> Change admin alias of current room. Set alias to "null" to clear it.<br />';
    output += '<span class="mediumOrchid">set room shop </span><span class="purple">-</span> Generate a shop for the current room.<br />';
    output += '<span class="mediumOrchid">set currency &lt;amount&gt; </span><span class="purple">-</span> Add money to your character.<br />';
    output += '<span class="mediumOrchid">set hp &lt;amount&gt; </span><span class="purple">-</span> Set the hp amount for your character.<br />';
    output += '<span class="mediumOrchid">set blleding &lt;value&gt; </span><span class="purple">-</span> Set the bleeding value for your character.<br />';
    output += '<span class="mediumOrchid">set debug &lt;on|off&gt; </span><span class="purple">-</span> Enable debug view.<br />';
    character.output(output);
  },
};
