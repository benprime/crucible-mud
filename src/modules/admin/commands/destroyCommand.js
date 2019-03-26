export default {
  name: 'destroy',
  desc: 'destroy an item or mob instance',
  admin: true,

  patterns: [
    /^destroy\s+(mob)\s+(.+)$/i,
    /^destroy\s+(item)\s+(.+)$/i,
    /^destroy/i,
    /^des\s+(mob)\s+(.+)$/i,
    /^des\s+(item)\s+(.+)$/i,
    /^des/i,
  ],

  parseParams(match) {
    if(match.length != 3) return false;
    let typeName = match[1];
    let objectID = match[2];
    return {actionName: this.name, actionParams: [typeName, objectID]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">destroy mob &lt;mob ID&gt; </span><span class="purple">-</span> Remove <mob> from current room.<br />';
    output += '<span class="mediumOrchid">destroy item &lt;item ID&gt; </span><span class="purple">-</span> Remove <item> from inventory.<br />';
    character.output(output);
  },
};
