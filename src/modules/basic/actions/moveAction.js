export default {
  name: 'move',
  execute(character, dir) {
    return character.move(dir).then(() => {
      // only leave your party on a successful move
      character.leader = null;
      character.emit('action', character, ['look', false]);
    }).catch(output => character.output(output));
  },
};
