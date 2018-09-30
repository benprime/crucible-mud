
import { getDirection } from '../../../core/directions';

export default {
  name: 'close',
  desc: 'close a door',


  patterns: [
    /^close\s+(\w+)$/i,
    /^cl\s+(\w+)$/i,
    /^close$/i,
  ],

  parseParams(match) {
    if(match.length < 2) return false;
    const dir = getDirection(match[1]);
    return [this.name, dir];
  },

  help(character) {
    const output = '<span class="mediumOrchid">close &lt;direction&gt; </span><span class="purple">-</span> Close a door in the given direction.<br />';
    character.output(output);
  },
};
