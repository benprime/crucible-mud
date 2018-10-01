export default {
  name: 'keys',
  execute(character) {
    const keys = character.keys || [];
    let keyOutput = keys.map(({ name }) => name).join(', ');
    if (!keyOutput) {
      keyOutput = 'None.';
    }

    let output = '<span class=\'cyan\'>Key ring: </span>';
    output += '<span class=\'silver\'>';
    output += keyOutput;
    output += '</span>';

    character.output(output);
    return true;
  },
};
