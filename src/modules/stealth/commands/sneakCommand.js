

export default {
  name: 'sneak',
  desc: 'activates stealthy movement.',


  patterns: [
    /^sneak$/i,
    /^sn$/i,
  ],

  parseParams() {
    return {actionName: this.name, actionParams: []};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">sneak</span><span class="purple">-</span> Activates a sneak bonus for the following stealth-based commands: move<br />';
    character.output(output);
  },

};
