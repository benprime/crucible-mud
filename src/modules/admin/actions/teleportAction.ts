import autocomplete from '../../../core/autocomplete';
import Room from '../../../models/room';

export default {
  name: 'teleport',
  execute(character, teleportTo) {
    if (!teleportTo) return;

    let toRoomId = '';
    if (teleportTo.x && teleportTo.y) {
      const room = Object.values(Room.roomCache).find(r => r.x == teleportTo.x && r.y == teleportTo.y && r.z == teleportTo.z);
      if (!room) {
        character.output('room not found in cache by coordinates');
        return false;
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
        return false;
      } else if (targetCharacter === character) {
        character.output('You cannot teleport to yourself.');
        return false;
      }
      toRoomId = targetCharacter.roomId;
    }

    character.teleport(toRoomId);
    character.output('You teleport...\n');
    character.toRoom(`<span class="yellow">${character.name} appears out of thin air!</span>`, [this.id]);
    return true;
  },
};
