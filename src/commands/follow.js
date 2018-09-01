import socketUtil from '../core/socketUtil';
import utils from '../core/utilities';
import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'follow',
  desc: 'accept an invite to follow another player',
  category: commandCategories.party,
  
  patterns: [
    /^follow\s+(\w+)$/i,
    /^follow\s.+$/i,
    /^join\s+(\w+)$/i,
    /^join\s.+$/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character, username) {
    const invitingCharacter = autocomplete.character(character, username);
    if (!invitingCharacter) {
      return Promise.reject('unknown player.');
    }

    if (invitingCharacter.roomId !== character.roomId) {
      return Promise.reject('That player doesn\'t appear to be in the room.');
    }

    if (!Array.isArray(character.partyInvites) || !character.partyInvites.includes(invitingCharacter.id)) {
      return Promise.reject('You must be invited.');
    }

    character.leader = invitingCharacter.id;

    const charMessages = [];

    // re-assign following sockets to new leader
    let followers = socketUtil.getFollowers(character.id);
    followers.forEach(c => {
      c.leader = invitingCharacter.id;
      charMessages.push({ charId: c.id, message: `<span class="yellow">Now following ${invitingCharacter.name}</span>` });
    });

    utils.removeItem(character.partyInvites, invitingCharacter.id);

    charMessages.push({ charId: character.id, message: `You are now following ${username}.` });
    charMessages.push({ charId: invitingCharacter.id, message: `${character.name} has started following you.` });

    return Promise.resolve({
      charMessages: charMessages,
    });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">follow <span class="purple">|</span> join &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    socket.emit('output', { message: output });
  },
};
