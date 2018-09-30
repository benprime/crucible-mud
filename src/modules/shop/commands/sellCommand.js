import autocomplete from '../../../core/autocomplete';


export default {
  name: 'sell',
  desc: 'sell your items at a shop',


  patterns: [
    /^sell\s+(.+)$/i,
    /^sell\s.*/i,
  ],

  parseParams(match, character) {
    if (match.length != 2) return false;
    const item = autocomplete.inventory(character, match[1]);
    return [this.name, item];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">sell &lt;item name&gt </span><span class="purple">-</span> sell an item to a shop. <br />';
    character.output(output);
  },
};
