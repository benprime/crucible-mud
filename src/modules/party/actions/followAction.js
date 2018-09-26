import socketUtil from '../../../core/socketUtil';
import utils from '../../../core/utilities';

export default {
  name: 'follow',
  execute(character, invitingCharacter) {
    if (!invitingCharacter) {
      character.output('unknown player.');
      return Promise.reject();
    }

    if (invitingCharacter.roomId !== character.roomId) {
      character.output('That player doesn\'t appear to be in the room.');
      return Promise.reject();
    }

    if (!Array.isArray(character.partyInvites) || !character.partyInvites.includes(invitingCharacter.id)) {
      character.output('You must be invited.');
      return Promise.reject();
    }

    character.leader = invitingCharacter.id;

    // re-assign following sockets to new leader
    let followers = socketUtil.getFollowers(character.id);
    followers.forEach(c => {
      c.leader = invitingCharacter.id;
      c.output(`<span class="yellow">Now following ${invitingCharacter.name}</span>`);
    });

    utils.removeItem(character.partyInvites, invitingCharacter.id);

    character.output(`You are now following ${invitingCharacter.username}.`);
    invitingCharacter.output(`${character.name} has started following you.`);

    return Promise.resolve();
  },
};
