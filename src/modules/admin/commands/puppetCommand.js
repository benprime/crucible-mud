import commandCategories from '../../../core/commandCategories';
import autocomplete from '../../../core/autocomplete';

export default {
  name: 'puppet',
  desc: 'cause a cosmetic action by an npc',
  category: commandCategories.admin,

  patterns: [
    /^puppet\s+(\w+)\s+(.+)/i,
    /^puppet\s+.*/i,
    /^puppet$/i,
  ],

  parseParams(match, character) {
    if(match.length < 3) return false;
    const mob = autocomplete.mob(character, match[1]);
    return [this.name, character, mob, match[2]];
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">puppet command</span><br/>';
    output += '<span class="mediumOrchid">puppet &lt;action string&gt;</span> <span class="purple">-</span> Make an NPC do a cosmetic action.<br />';
    character.output(output);
  },
};
