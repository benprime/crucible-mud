import commandCategories from '../core/commandCategories';

export default {
  name: 'experience',
  desc: 'show you currency experience level',
  category: commandCategories.character,
  
  patterns: [
    /^experience$/i,
    /^exp$/i,
    /^xp$/i,
  ],

  dispatch(socket) {
    return this.execute(socket.character)
      .then(output => socket.character.output(output));
  },

  execute(character) {
    let output = '<span class=\'cyan\'>XP: </span>';
    output += `<span class='silver'>${character.xp}</span>\n`;
    output += '<span class=\'cyan\'>Level: </span>';
    output += `<span class='silver'>${character.level}</span>\n`;
    output += '<span class=\'cyan\'>Next: </span>';
    output += `<span class='silver'>${character.nextExp()}</span>\n`;

    return Promise.resolve(output);
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">exp </span><span class="purple">-</span> Shows current user experience points.<br />';
    character.output(output);
  },
};
