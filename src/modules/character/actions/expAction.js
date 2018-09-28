export default {
  name: 'experience',
  execute(character) {
    let output = '<span class=\'cyan\'>XP: </span>';
    output += `<span class='silver'>${character.xp}</span>\n`;
    output += '<span class=\'cyan\'>Level: </span>';
    output += `<span class='silver'>${character.level}</span>\n`;
    output += '<span class=\'cyan\'>Next: </span>';
    output += `<span class='silver'>${character.nextExp()}</span>\n`;

    character.output(output);
    return Promise.resolve();
  },
};
