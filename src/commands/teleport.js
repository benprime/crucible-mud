import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import lookCmd from './look';
import Room from '../models/room';
import { commandCategories } from '../core/commandManager';

export default {
  name: 'teleport',
  desc: 'teleport to another user\'s location',
  category: commandCategories.admin,
  admin: true,

  patterns: [
    /^teleport\s+(\w+)$/i,
    /^teleport\s+(\d+)\s(\d+)\s?(\d+)?$/i,
    /^tele\s+(\w+)$/i,
    /^tele\s+(\d+)\s(\d+)\s?(\d+)?$/i,
  ],

  dispatch(socket, match) {
    // teleport to room coordinates
    let promise;
    if (match.length >= 3) {
      promise = this.execute(socket.character, {
        x: match[1],
        y: match[2],
        z: match[3] || 0,
      });

    } else {
      promise = this.execute(socket.character, match[1]);
    }

    promise
      .then(response => socketUtil.sendMessages(socket, response))
      .then(() => lookCmd.execute(socket.character, false).then(output => socketUtil.sendMessages(socket, output)))
      .catch(err => socketUtil.sendMessages(socket, err));
  },

  execute(character, teleportTo) {
    if (!teleportTo) return;

    let toRoomId = '';
    if (teleportTo.x && teleportTo.y) {
      const room = Object.values(Room.roomCache).find(r => r.x == teleportTo.x && r.y == teleportTo.y && r.z == teleportTo.z);
      if (!room) return Promise.reject('room not found in cache by coordinates');
      toRoomId = room.id;

      // if the parameter is an object id or alias, we are definitely teleporting to a room.
    } else if (Room.roomCache[teleportTo]) {
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

    return character.teleport(toRoomId);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">teleport &lt;room ID&gt;</span><span class="purple">-</span> Teleport to &lt;room&gt;.<br />';
    output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><span class="purple">-</span> Teleport to &lt;player&gt;.<br />';
    socket.emit('output', { message: output });
  },
};
