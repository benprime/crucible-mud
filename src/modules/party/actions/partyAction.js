export default {
  name: 'party',
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
};
