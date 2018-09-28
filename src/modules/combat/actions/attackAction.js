import config from '../../../config';

export default {
  name: 'attack',
  execute(character, mob) {
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
};
