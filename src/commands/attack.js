import autocomplete from '../core/autocomplete';
import config from '../config';
import commandCategories from '../core/commandCategories';

export default {
  name: 'attack',
  desc: 'attack a monster',
  category: commandCategories.combat,

  patterns: [
    /^a\s+(.+)$/i,
    /^att\s+(.+)$/i,
    /^attack\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1]);
  },

  execute(character, targetName) {

    const mob = autocomplete.mob(character, targetName);
    if (!mob) {
      character.attackTarget = null;
      character.output('You don\'t see anything like that here.');
      return Promise.reject();
    }

    character.attackTarget = mob.id;
    character.attackInterval = character.attacksPerRound * config.ROUND_DURATION;

    character.output('<span class="olive">*** Combat Engaged ***</span>');
    character.toRoom(`${character.name} moves to attack ${mob.displayName}!`, [character.id]);

    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">attack &lt;mob name&gt;<span class="purple">|</span> a</span> <span class="purple">-</span> Begin combat attacking &lt;target&gt;.<br />';
    character.output(output);
  },
};
