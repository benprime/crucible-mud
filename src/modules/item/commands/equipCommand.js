import autocomplete from '../../../core/autocomplete';


export default {
  name: 'equip',
  desc: 'wield a weapon or wear armor you are currently carrying',

  
  patterns: [
    /^eq\s+(.+)$/i,
    /^equip\s+(.+)$/i,
    /^wield\s+(.+)$/i,
    /^wear\s+(.+)$/i,
    /^equip$/i,
    /^eq$/i,
  ],

  parseParams(match, character) {
    if (match.length < 2) return false;
    const item = autocomplete.inventory(character, match[1]);
    return [this.name, item];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon or ring, specify main/off to equip to one hand or the other (if able).<br />';
    character.output(output);
  },
};
