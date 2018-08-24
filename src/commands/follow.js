import socketUtil from '../core/socketUtil';
import utils from '../core/utilities';

export default {
  name: 'follow',

  patterns: [
    /^follow\s+(\w+)$/i,
    /^follow\s.+$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character, username) {
    const invitingCharacter = socketUtil.characterInRoom(character, username);
    if (!invitingCharacter) {
      return;
    }

    if (!Array.isArray(character.partyInvites) || !character.partyInvites.includes(invitingCharacter.id)) {
      return Promise.reject('You must be invited.');
    }

    character.leader = invitingCharacter.id;

    const charMessages = [];

    // re-assign following sockets to new leader
    let followers = socketUtil.getFollowingCharacters(character.id);
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
    const output = '<span class="mediumOrchid">invite &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    socket.emit('output', { message: output });
  },
};
