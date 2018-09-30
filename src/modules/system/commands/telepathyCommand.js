
import telepathyAction from '../actions/telepathyAction';

export default {
  name: 'telepathy',
  desc: 'communicate directly to a single user',

  action: telepathyAction.name,

  patterns: [
    /^\/(\w+)\s+(.*)$/,
    /^\/.*$/,
    /^telepathy\s+(\w+)\s+(.*)$/,
  ],

  parseParams(match) {
    if(match.length < 3) return;
    // telepath command currently overloaded for party chat. (so no lookup of character here)
    // TODO: create a separate party chat command and parse /par <message> pattern before telepathy.
    return [this.name, match[1], match[2]];
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">telepathy command</span><br/>';
    output += '<span class="mediumOrchid">&#x2F;<message></span> <span class="purple">-</span> Send message directly to a single player.<br />';
    character.output(output);
  },
};
