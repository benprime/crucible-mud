export default {
  name: 'stats',
  execute(character) {
    let output = `<span class="cyan">HP: </span><span class="silver">${character.currentHP}/${character.maxHP}</span>\n`;
    output += `You are ${character.status()}.\n`;
    if(character.bleeding) {
      output += '<span class="red">You are bleeding out!</span>\n';
    }

    character.output(output);
    return Promise.resolve();
  },
};
