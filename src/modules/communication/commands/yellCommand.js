export default {
  name: 'yell',
  desc: 'shout a message to current and all adjacent rooms',

  patterns: [
    /^"(.+)"?/,
    /^yell\s+(.+)/i,
  ],

  parseParams(match) {
    return {actionName: this.name, actionParams: [match[1]]};
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">yell command</span><br/>';
    output += '<span class="mediumOrchid">"<message></span> <span class="purple">-</span> Yell to this room and all adjacent rooms.<br />';
    character.output(output);
  },
};
