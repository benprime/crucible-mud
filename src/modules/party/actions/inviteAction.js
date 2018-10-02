export default {
  name: 'invite',
  execute(character, targetCharacter) {

    if (character.leader) {
      character.output('Only the party leader may invite followers.');
      return false;
    }

    if (!targetCharacter) {
      character.output('unknown player');
      return false;
    }

    if (character.roomId !== targetCharacter.roomId) {
      character.output('That player does not appear to be in the room.');
      return false;
    }

    if (!targetCharacter.partyInvites) {
      targetCharacter.partyInvites = [];
    }

    if (!targetCharacter.partyInvites.includes(character.id)) {
      targetCharacter.partyInvites.push(character.id);
    }
    
    targetCharacter.output(`${character.name} has invited you to join a party. Type 'follow ${character.name}' to accept.`);
    character.output(`You have invited ${targetCharacter.name} to join your party.`);

    return true;

    // TODO: make party invites timeout
    // setTimeout(() => {
    //   let itemIndex = toUserSocket.character.offers.findIndex(o => o.item.id === item.id);
    //   if (itemIndex !== -1) {
    //     toUserSocket.character.offers.splice(itemIndex, 1);
    //   }
    //   if (cb) cb();
    // }, 60000);
  },
};
