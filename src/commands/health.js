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
    return this.execute(socket.character);
  },

  execute(character) {
    let output = `<span class="cyan">HP: </span><span class="silver">${character.currentHP}/${character.maxHP}</span>\n`;
    output += `You are ${character.status()}.\n`;
    if(character.bleeding) {
      output += '<span class="red">You are bleeding out!</span>\n';
    }

    character.output(output);
    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">health </span><span class="purple">-</span> Display your current health status.<br />';
    character.output(output);
  },
};
