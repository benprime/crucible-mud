import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'invite',
  desc: 'invite another player to follow you',
  category: commandCategories.party,

  patterns: [
    /^invite\s+(\w+)$/i,
    /^invite\s.+$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      return this.help(socket.character);
    }
    return this.execute(socket.character, match[1])
      .catch(error => socket.character.output(error));
  },

  execute(character, username) {

    if (character.leader) {
      return Promise.reject('Only the party leader may invite followers.');
    }

    const targetCharacter = autocomplete.character(character, username);
    if (!targetCharacter) {
      return Promise.reject('unknown player');
    }

    if (character.roomId !== targetCharacter.roomId) {
      return Promise.reject('That player does not appear to be in the room.');
    }

    if (!targetCharacter.partyInvites) {
      targetCharacter.partyInvites = [];
    }

    if (!targetCharacter.partyInvites.includes(character.id)) {
      targetCharacter.partyInvites.push(character.id);
    }
    
    targetCharacter.output(`${character.name} has invited you to join a party.`);
    character.output(`You have invited ${targetCharacter.name} to join your party.`);

    return Promise.resolve();

    // TODO: make party invites timeout
    // setTimeout(() => {
    //   let itemIndex = toUserSocket.character.offers.findIndex(o => o.item.id === item.id);
    //   if (itemIndex !== -1) {
    //     toUserSocket.character.offers.splice(itemIndex, 1);
    //   }
    //   if (cb) cb();
    // }, 60000);
  },

  help(character) {
    const output = '<span class="mediumOrchid">invite &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    character.output(output);
  },
};
