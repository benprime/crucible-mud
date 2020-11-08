import autocomplete from '../../../core/autocomplete';

import { getDirection } from '../../../core/directions';

export default {
  name: 'kick',
  desc: 'kick an item in a particular direction',


  patterns: [
    /^kick\s+(.+)\s+(\w+)$/i,
    /^kick\s+(.+)$/i,
    /^kick$/i,
  ],

  parseParams(match, character) {
    if (match.length < 3) return false;
    const item = autocomplete.room(character, match[1]);
    const dir = getDirection(match[2]);
    return {actionName: this.name, actionParams: [item, dir]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">kick &lt;item name&gt; &lt;dir&gt;</span><span class="purple">-</span> Kick &lt;item&gt; from this room to the direction specified in &lt;dir&gt;<br />';
    character.output(output);
  },
};
