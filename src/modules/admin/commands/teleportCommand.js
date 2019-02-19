export default {
  name: 'teleport',
  desc: 'teleport to another user\'s location',
  admin: true,

  patterns: [
    // player
    /^teleport\s+(\w+)$/i,
    /^tele\s+(\w+)$/i,

    // room coordinates
    /^teleport\s+(\d+)\s(\d+)\s?(\d+)?$/i,
    /^tele\s+(\d+)\s(\d+)\s?(\d+)?$/i,

    // catch all
    /^tele\s+(.*)$/i,
    /^teleport\s+(.*)$/i,
  ],

  parseParams(match) {
    // teleport to room coordinates
    let param;
    if (match.length >= 3) {
      param = {
        x: match[1],
        y: match[2],
        z: match[3] || 0,
      };

    } else {
      param = match[1];
    }
    return {actionName: this.name, actionParams: [param]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">teleport &lt;room ID&gt;</span><span class="purple">-</span> Teleport to &lt;room&gt;.<br />';
    output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><span class="purple">-</span> Teleport to &lt;player&gt;.<br />';
    character.output(output);
  },
};
