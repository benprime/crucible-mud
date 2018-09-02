import commandCategories from '../core/commandCategories';

export default {
  name: 'gossip',
  desc: 'chat in a global channel, visible to all rooms',
  category: commandCategories.system,
  
  patterns: [
    /^gossip\s+?(.+)/i,
    /^gos\s+?(.+)/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1]);
  },

  execute(character, message) {
    return character.gossip(message);
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">gossip &lt;message&gt; </span><span class="purple">-</span> Send messages to all connected players.<br />';
    character.output(output);
  },
};
