export default {
  name: 'equip',
  execute: (character, item) => {

    if (!item) {
      character.output('You don\'t seem to be carrying that!\n');
      return false;
    }

    // check if item is equipable or return
    if (!item.equipSlots || item.equipSlots.length === 0) {
      character.output('You cannot equip that!\n');
      return false;
    }

    character.equipped.equip(item);
    character.save(err => { if (err) throw err; });

    return true; // output taken care of in character model
  },

};