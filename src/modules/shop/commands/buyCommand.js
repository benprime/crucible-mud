

export default {
  name: 'buy',
  desc: 'buy item from a shop',


  patterns: [
    /^buy\s+(.+)$/i,
    /^buy\s.*/i,
  ],

  parseParams(match) {
    if (match.length < 2) return false;
    return [this.name, match[1]];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">buy &lt;item name&gt </span><span class="purple">-</span> Buy an item from a shop. <br />';
    character.output(output);
  },
};
