import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';
import autocomplete from '../core/autocomplete';

export default {
  name: 'puppet',
  desc: 'cause a cosmetic action by an npc',
  category: commandCategories.admin,

  patterns: [
    /^puppet\s+(\w+)\s+(.+)/i,
    /^puppet\s+.*/i,
    /^puppet$/i,
  ],

  parseParams(character, match) {
    const mob = autocomplete.mob(character, match[1]);
    return [character, mob, match[2]];
  },

  dispatch(socket, match) {
    if(match.length < 3) {
      return this.help(socket.character);
    }
    const params = this.parseParams(socket.character, match);
    return this.execute.apply(this, params);
  },

  execute(character, mob, actionString) {
    socketUtil.roomMessage(character.roomId, `${mob.displayName} ${actionString}`);
    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">puppet command</span><br/>';
    output += '<span class="mediumOrchid">puppet &lt;action string&gt;</span> <span class="purple">-</span> Make an NPC do a cosmetic action.<br />';
    character.output(output);
  },
};
