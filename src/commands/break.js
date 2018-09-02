import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';

export default {
  name: 'break',
  desc: 'break off combat',
  category: commandCategories.combat,

  patterns: [
    /^br$/i,
    /^break$/i,
  ],

  dispatch(socket) {
    return this.execute(socket.character)
      .catch(error => socket.character.output(error));
  },

  execute(character) {

    if (character.attackTarget) {
      character.output('<span class="olive">*** Combat Disengaged ***</span>');
      character.toRoom(`${character.name} breaks off his attack.`, [character.id]);
    }

    character.break();

    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">break <span class="purple">|</span> br</span> <span class="purple">-</span> End combat.<br />';
    character.output(output);
  },

};
