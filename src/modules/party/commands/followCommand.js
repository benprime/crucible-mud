import autocomplete from '../../../core/autocomplete';


export default {
  name: 'follow',
  desc: 'accept an invite to follow another player',


  patterns: [
    /^follow\s+(\w+)$/i,
    /^follow\s.+$/i,
    /^join\s+(\w+)$/i,
    /^join\s.+$/i,
  ],

  parseParams(match, character) {
    const invitingCharacter = autocomplete.character(character, match[1]);
    return {actionName: this.name, actionParams: [invitingCharacter]};
  },

  help(character) {
    const output = '<span class="mediumOrchid">follow <span class="purple">|</span> join &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    character.output(output);
  },
};
