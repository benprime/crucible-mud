export default {
  name: 'unequip',
  execute: (character, item) => {
    character.equipped.unequip(item);
    character.save(err => { if (err) throw err; });
    return true;
  },
};