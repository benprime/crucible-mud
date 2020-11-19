

export default {
  name: 'stock',
  desc: 'add item types to an existing shop',

  admin: true,

  patterns: [
    /^stock\s+(.+)\s+(\d+)$/i,
    /^stock\s.*$/i,
    /^stock$/i,
  ],

  parseParams(match) {
    if (match.length < 3) return false;
    return {actionName: this.name, actionParams: [match[1], match[2]]};
  },

  help(character) {
    const output = '<span class="mediumOrchid">stock &lt;item type&gt; &lt;quantity&gt;</span><span class="purple">-</span> Creates items to stock stores with.<br />';
    character.output(output);
  },
};
