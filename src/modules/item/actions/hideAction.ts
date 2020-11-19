import { Direction } from '../../../core/directions';
import Room from '../../../models/room';
import autocomplete from '../../../core/autocomplete';

function hideDir(character, room, dir) {
  let exit = room.getExit(dir.short);
  if (!exit) {
    character.output('No exit in that direction.<br />');
    return false;
  }

  exit.hidden = true;
  room.save(err => { if (err) throw err; });

  character.output('The exit has been concealed.<br />');
  return true;
}

// for items
function hideItem(character, room, itemName) {

  const acResult = autocomplete.multiple(character, ['inventory', 'room'], itemName);
  if (!acResult) {
    character.output('Item does not exist in inventory or in room.<br />');
    return false;
  }

  const hideTargetObj = acResult.item;

  if (!hideTargetObj) {
    character.output('Item does not exist in inventory or in room.<br />');
    return false;
  }

  hideTargetObj.hidden = true;
  room.save(err => { if (err) throw err; });

  character.output(`${itemName} has been concealed.<br />`);
  return true;
}

export default {
  name: 'hide',
  execute(character, item) {
    const room = Room.getById(character.roomId);

    if (item instanceof Direction) {
      return hideDir(character, room, item);
    } else {
      return hideItem(character, room, item);
    }
  },
};