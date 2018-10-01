import autocomplete from '../../../core/autocomplete';
import { currencyToInt } from '../../../core/currency';


export default {
  name: 'offer',
  desc: 'offer an item to another player',


  patterns: [
    /^offer\s+(.+)\s+to\s+(.+)$/i,
    /^off\s+(.+)\s+to\s+(.+)$/i,
    /^offer\s.*$/i,
    /^offer$/i,
    /^off\s.*$/i,
    /^off$/i,
  ],

  parseParams(match, character) {
    if (match.length < 3) return false;
    let item = autocomplete.inventory(character, match[1]);
    let currency = currencyToInt(match[1]);
    const toCharacter = autocomplete.character(character, match[2]);
    return [this.name, item, currency, toCharacter];
  },

  help(character) {
    let output = '<span class="mediumOrchid">offer &lt;item&gt; to &lt;player&gt; </span><span class="purple">-</span> Offer an item to another player.<br />';
    output += '<span class="mediumOrchid">offer 10gp to &lt;player&gt; </span><span class="purple">-</span> Offer currency to another player.<br />';
    character.output(output);
  },
};
