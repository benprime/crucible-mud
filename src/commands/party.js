import socketUtil from '../core/socketUtil';
import { commandCategories } from '../core/commandManager';

export default {
  name: 'party',
  desc: 'list the members of your current party',
  category: commandCategories.party,
  
  patterns: [
    /^party$/i,
    /^par$/i,
  ],

  dispatch(socket) {
    this.execute(socket.character)
      .then(output => socketUtil.output(socket, output))
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character) {
    const leadCharacterId = character.leader ? character.leader : character.id;
    return character.getPartyCharacters().then(followers => {
      if (followers.length === 1) {
        return Promise.reject('You are not in a party.');
      }

      let output = 'The following people are in your party:\n';
      followers.forEach(follower => {
        output += `${follower.name}`;
        if (follower.id === leadCharacterId) {
          output += ' (Leader)';
        }
        output += '\n';
      });

      return Promise.resolve(output);

    });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">party</span> <span class="purple">-</span> Display list of party members.<br />';
    socket.emit('output', { message: output });
  },
};
