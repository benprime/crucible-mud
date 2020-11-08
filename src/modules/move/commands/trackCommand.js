

export default {
  name: 'track',
  desc: 'attempt to track another player',


  patterns: [
    /^track\s+(\w+)$/i,
    /^track$/i,
  ],

  parseParams(match) {
    if (match.length != 2) return false;
    return {actionName: this.name, actionParams: [match[1]]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">track</span> <span class="purple">-</span> attempt to track a player that has passed through your current room.<br />';
    character.output(output);
  },
};
