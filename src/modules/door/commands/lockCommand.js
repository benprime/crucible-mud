import autocomplete from '../../../core/autocomplete';

import { getDirection } from '../../../core/directions';

export default {
  name: 'lock',
  desc: 'lock a door',

  admin: true,

  patterns: [
    /^lock\s+(\w+)\s+with\s+(.+)$/i,
    /^lock\s+/i,
    /^lock$/i,
  ],

  parseParams(match, character) {
    if(match.length != 3) return;
    const dir = getDirection(match[1]);
    const key = autocomplete.key(character, match[2]);
    return [this.name, dir, key];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">lock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Lock a door with the key type you are carrying.<br />';
    character.output(output);
  },

};
