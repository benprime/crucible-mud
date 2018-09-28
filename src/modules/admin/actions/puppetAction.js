import socketUtil from '../../../core/socketUtil';

export default {
  name: 'puppet',
  execute(character, mob, actionString) {
    socketUtil.roomMessage(character.roomId, `${mob.displayName} ${actionString}`);
    return Promise.resolve();
  },
};
