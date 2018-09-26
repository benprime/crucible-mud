import autocomplete from '../../../core/autocomplete';
import commandCategories from '../../../core/commandCategories';

export default {
  name: 'follow',
  desc: 'accept an invite to follow another player',
  category: commandCategories.party,

  patterns: [
    /^follow\s+(\w+)$/i,
    /^follow\s.+$/i,
    /^join\s+(\w+)$/i,
    /^join\s.+$/i,
  ],

  parseParams(match) {
    const invitingCharacter = autocomplete.character(match[1]);
    return [this.name, invitingCharacter];
  },

  help(character) {
    const output = '<span class="mediumOrchid">follow <span class="purple">|</span> join &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    character.output(output);
  },
};
