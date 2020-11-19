import socketUtil from '../../../core/socketUtil';

export default {
  name: 'drag',
  execute(character, targetPlayer) {

    if (!targetPlayer) {
      character.output('unknown player.');
      return false;
    }

    if (targetPlayer.roomId !== character.roomId) {
      character.output('That player doesn\'t appear to be in the room.');
      return false;
    }

    if (!targetPlayer.isIncapacitated()) {
      character.output(`${targetPlayer.name} is not in need of your assistance.`);
      return false;
    }

    if(character.dragging === targetPlayer.id) {
      character.output(`You are already dragging ${targetPlayer.name}.`);
      return false;
    }

    const draggers = socketUtil.getRoomSockets(character.roomId)
      .filter(s => s.character.dragging === targetPlayer.id)
      .map(s => s.character);

    if (draggers.length > 0) {
      character.output(`${targetPlayer.name} is already being dragged by ${draggers[0].name}.`);
      return false;
    }

    character.dragging = targetPlayer.id;

    targetPlayer.output(`<span class="silver">${character.name} starts dragging you.</span>`);
    character.toRoom(`<span class="silver">${character.name} starts dragging ${targetPlayer.name}.</span>`, [targetPlayer.id]);
    character.output(`<span class="silver">You are now dragging ${targetPlayer.name}.</span>`);

    return true;
  },
};
