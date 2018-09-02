import commandCategories from '../core/commandCategories';

export default {
  name: 'party',
  desc: 'list the members of your current party',
  category: commandCategories.party,
  
  patterns: [
    /^party$/i,
    /^par$/i,
  ],

  dispatch(socket) {
    return this.execute(socket.character);
  },

  execute(character) {
    const leadCharacterId = character.leader ? character.leader : character.id;
    return character.getPartyCharacters().then(followers => {
      if (followers.length === 1) {
        character.output('You are not in a party.');
        return Promise.reject();
      }

      let output = 'The following people are in your party:\n';
      followers.forEach(follower => {
        output += `${follower.name}`;
        if (follower.id === leadCharacterId) {
          output += ' (Leader)';
        }
        output += '\n';
      });

      character.output(output);
    });
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">party</span> <span class="purple">-</span> Display list of party members.<br />';
    character.output(output);
  },
};
