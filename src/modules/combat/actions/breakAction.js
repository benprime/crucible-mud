export default {
  name: 'break',
  execute(character) {

    if (character.attackTarget) {
      character.output('<span class="olive">*** Combat Disengaged ***</span>');
      character.toRoom(`${character.name} breaks off his attack.`, [character.id]);
    }
    character.break();

    return true;
  },
};
