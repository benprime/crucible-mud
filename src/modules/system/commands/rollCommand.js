
import rollAction from '../actions/rollAction';

export default {
  name: 'roll',
  desc: 'roll a dice',

  action: rollAction.name,

  patterns: [
    /^roll$/i,
    /^roll\s+(.+)$/i,
  ],

  parseParams(match) {
    if (match.length < 2) return [this.name];
    return [this.name, match[1]];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">roll</span> <span class="purple">-</span> Rolls a players Action Die and displays result.<br />';
    output += '<span class="mediumOrchid">roll &lt;die type&gt;</span> <span class="purple">-</span> Rolls &lt;die type&gt; and displays result.  Example: "Roll 1d6" would roll 1 6-sided die.<br />';
    character.output(output);
  },
};
