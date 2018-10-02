import autocomplete from '../../../core/autocomplete';


export default {
  name: 'take',
  desc: 'take an item',


  patterns: [
    /^take\s+(.+)$/i,
    /^get\s+(.+)$/i,
    /^take/i,
    /^get/i,
  ],

  parseParams(match, character) {
    if (match.length < 2) return false;
    const item = autocomplete.room(character, match[1]);
    return [this.name, item];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />';
    character.output(output);
  },
};
