export default {
  name: 'party',
  execute(character) {
    const leadCharacterId = character.leader ? character.leader : character.id;
    const followers = character.getPartyCharacters();

    if (followers.length === 1) {
      character.output('You are not in a party.');
      return false;
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
    return true;
  },
};
