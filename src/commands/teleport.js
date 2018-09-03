import autocomplete from '../core/autocomplete';
import Room from '../models/room';
import commandCategories from '../core/commandCategories';

export default {
  name: 'teleport',
  desc: 'teleport to another user\'s location',
  category: commandCategories.admin,
  admin: true,

  patterns: [
    // player
    /^teleport\s+(\w+)$/i,
    /^tele\s+(\w+)$/i,

    // room coordinates
    /^teleport\s+(\d+)\s(\d+)\s?(\d+)?$/i,
    /^tele\s+(\d+)\s(\d+)\s?(\d+)?$/i,

    // catch all
    /^tele\s+(.*)$/i,
    /^teleport\s+(.*)$/i,
  ],

  dispatch(socket, match) {
    // teleport to room coordinates
    let param;
    if (match.length >= 3) {
      param = {
        x: match[1],
        y: match[2],
        z: match[3] || 0,
      };

    } else {
      param = match[1];
    }

    return this.execute(socket.character, param);
  },

  execute(character, teleportTo) {
    if (!teleportTo) return;

    let toRoomId = '';
    if (teleportTo.x && teleportTo.y) {
      const room = Object.values(Room.roomCache).find(r => r.x == teleportTo.x && r.y == teleportTo.y && r.z == teleportTo.z);
      if (!room) {
        character.output('room not found in cache by coordinates');
        return Promise.reject();
      }
      toRoomId = room.id;

      // if the parameter is an object id or alias, we are definitely teleporting to a room.
    } else if (Room.roomCache[teleportTo]) {
      toRoomId = teleportTo;
      // otherwise, we are teleporting to a user
    } else {

      // autocomplete username
      const targetCharacter = autocomplete.character(character, teleportTo);
      if (!targetCharacter) {
        character.output('Target not found.');
        return Promise.reject();
      } else if (targetCharacter === character) {
        character.output('You cannot teleport to yourself.');
        return Promise.reject();
      }
      toRoomId = targetCharacter.roomId;
    }

    return character.teleport(toRoomId).then(() => {
      character.output('You teleport...\n');
      character.toRoom(`<span class="yellow">${this.name} appears out of thin air!</span>`, [this.id]);
    });
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">teleport &lt;room ID&gt;</span><span class="purple">-</span> Teleport to &lt;room&gt;.<br />';
    output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><span class="purple">-</span> Teleport to &lt;player&gt;.<br />';
    character.output(output);
  },
};
