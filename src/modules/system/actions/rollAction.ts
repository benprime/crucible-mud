import dice from '../../../core/dice';

export default {
  name: 'roll',

  execute(character, dieType?) {
    let rollValue = '';
    let output = '';

    if (dieType) {
      rollValue = dice.roll(dieType);
      output = `${dieType} Roll Result:  ${rollValue}<br />`;
    }
    else {
      rollValue = dice.roll(character.actionDie);
      output = `Action Die Roll Result:  ${rollValue}<br />`;
    }

    character.output(output);
  },

};
