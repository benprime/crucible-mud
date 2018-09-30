import autocomplete from '../../../core/autocomplete';


export default {
  name: 'hide',
  desc: 'hide an item in your current room',


  patterns: [
    /^hide$/i,
    /^hide\s+(.+)$/i,
  ],

  parseParams(match, character) {
    if (match.length < 2) return false;
    const item = autocomplete.inventory(character, match[1]);
    return [this.name, item];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">hide &lt;item name/exit dir&gt; </span><span class="purple">-</span> Make target &lt;item name/exit dir&gt; hidden.<br />';
    character.output(output);
  },

};
