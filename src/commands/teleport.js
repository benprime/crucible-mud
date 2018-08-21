import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import lookCmd from './look';
import Room from '../models/room';

export default {
  name: 'teleport',
  admin: true,

  patterns: [
    /^teleport\s+(\w+)$/i,
    /^tele\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1]).then(() => lookCmd.execute(socket.character, false));
  },

  execute(character, teleportTo) {
    if (!teleportTo) return;

    let toRoomId = '';
    
    // if the parameter is an object id or alias, we are definitely teleporting to a room.
    if (Room.roomCache[teleportTo]) {
      toRoomId = teleportTo;




      // otherwise, we are teleporting to a user
    } else {

      // autocomplete username
      const targetCharacter = autocomplete.character(character, teleportTo);
      if (!targetCharacter) {
        return Promise.reject('Target not found.');
      }
      toRoomId = targetCharacter.roomId;
    }

    character.teleport(toRoomId);
    return Promise.resolve();
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">teleport &lt;room ID&gt;</span><span class="purple">-</span> Teleport to &lt;room&gt;.<br />';
    output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><span class="purple">-</span> Teleport to &lt;player&gt;.<br />';
    socket.emit('output', { message: output });
  },
};
