import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';

export default {
  name: 'stats',
  desc: 'display your current hit points and wounded level',
  category: commandCategories.character,
  
  patterns: [
    /^health$/i,
    /^hea$/i,
  ],

  dispatch(socket) {
    this.execute(socket.character)
      .then(output => socketUtil.output(socket, output));
  },

  execute(character) {
    let output = `<span class="cyan">HP: </span><span class="silver">${character.currentHP}/${character.maxHP}</span>\n`;
    output += `You are ${character.status()}.\n`;
    if(character.bleeding) {
      output += '<span class="red">You are bleeding out!</span>\n';
    }

    return Promise.resolve(output);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">health </span><span class="purple">-</span> Display your current health status.<br />';
    socket.emit('output', { message: output });
  },
};
