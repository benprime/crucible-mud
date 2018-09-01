import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';
import Room from '../models/room';
import characterStates from '../core/characterStates';
import healthStatus from '../models/enums/healthStatuses';
import { pronounReflexive, pronounSubject } from '../core/language';

export default {
  name: 'rest',
  desc: 'Gain HP at an increased rate while idle',
  category: commandCategories.special,

  patterns: [
    /^rest$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character) {

    const room = Room.getById(character.roomId);
    if (room.mobs.length > 0) {
      return Promise.reject('<span class="red">You cannot rest with enemies in the room!</span>\n');
    }

    character.setState(characterStates.resting);

    const status = character.status();
    let msg = '<span class="silver">';
    switch (status) {
      case healthStatus.SEVERELY_WOUNDED:
        msg += `${character.name} collapses to the ground for some much needed rest.`;
        break;
      case healthStatus.MODERATELY_WOUNDED:
        msg += `${character.name} stumbles to the ground for some much needed rest.`;
        break;
      case healthStatus.LIGHTLY_WOUNDED:
        msg += `${character.name} winces as ${pronounSubject(character.gender)} lowers ${pronounReflexive(character.gender)} to the ground for some much needed rest.`;
        break;
    }
    msg += `${character.name} is resting.`;
    msg += '</span>\n';

    room.output(msg);
    return Promise.resolve();
  },

  help(socket) {
    const output = '<span class="mediumOrchid">rest </span><span class="purple">-</span> Recover hit points faster when idle.<br />';
    socket.emit('output', { message: output });
  },
};
