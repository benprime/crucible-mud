export default {
  name: 'unequip',
  // validate: (room, character, item) => {
  //   // validate params
  //   if (!item) {
  //     return Promise.reject('You don\'t seem to be carrying that.');
  //   }
  //   // validate character
  //   // validate item
  // },
  execute: (character, item) => {
    character.equipped.unequip(item);
    character.save(err => { if (err) throw err; });
    return Promise.resolve();
  },
};