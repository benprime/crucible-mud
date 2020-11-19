

export default {
  name: 'gossip',
  desc: 'chat in a global channel, visible to all rooms',


  patterns: [
    /^gossip\s+?(.+)/i,
    /^gos\s+?(.+)/i,
  ],

  parseParams(match) {
    if (match.length != 2) return;
    return {actionName: this.name, actionParams: [match[1]]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">gossip &lt;message&gt; </span><span class="purple">-</span> Send messages to all connected players.<br />';
    character.output(output);
  },
};
