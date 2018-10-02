import Room from '../../../models/room';
import utils from '../../../core/utilities';

export default {
  name: 'take',
  execute(character, item, admin) {

    function saveItem(item) {
      // and give it to the user
      if (item.type === 'key') {
        character.keys.push(item);
      } else {
        character.inventory.push(item);
      }
      character.save(err => { if (err) throw err; });
    }
  
    if (item) {
  
      // fixed items cannot be taken, such as a sign.
      if (item.fixed) {
        character.output('You cannot take that!');
        return false;
      }

      if (item.hidden && !admin) {
        //ignore players from unknowingly grabbing a hidden item
        character.output('You don\'t see that here!');
        return false;
      }

      // take the item from the room
      const room = Room.getById(character.roomId);
      utils.removeItem(room.inventory, item);
  
      saveItem(item);
      room.save(err => { if (err) throw err; });
  
      character.output(`${item.name} taken.`);
      character.toRoom(`${character.name} takes ${item.name}.`, [character.id]);
      return true;
    }
  
    character.output('You don\'t see that here!');
    return false;
  },
  
};
