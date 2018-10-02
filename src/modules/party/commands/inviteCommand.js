
import autocomplete from '../../../core/autocomplete';

export default {
  name: 'invite',
  desc: 'invite another player to follow you',


  patterns: [
    /^invite\s+(\w+)$/i,
    /^invite\s.+$/i,
  ],

  parseParams(match, character) {
    if(match.length < 2) return false;
    const targetCharacter = autocomplete.character(character, match[1]);
    return [this.name, targetCharacter];
  },

  help(character) {
    const output = '<span class="mediumOrchid">invite &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    character.output(output);
  },
};
