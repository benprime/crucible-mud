import dice from '../core/dice';

export default {
  name: 'roll',

  patterns: [
    /^roll$/i,
    /^roll\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    let dieType = null;
    if (match.length > 1) {
      dieType = match[1];
    }
    this.execute(socket, dieType);
  },

  execute(socket, dieType) {
    let rollValue = '';
    let output = '';

    if(dieType) {
      rollValue = dice.roll(dieType);
      output = `${dieType} Roll Result:  ${rollValue}<br />`;
    }
    else {
      rollValue = dice.roll(socket.user.actionDie);
      output = `Action Die Roll Result:  ${rollValue}<br />`;
    }

    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">roll</span> <span class="purple">-</span> Rolls a players Action Die and displays result.<br />';
    output += '<span class="mediumOrchid">roll &lt;die type&gt;</span> <span class="purple">-</span> Rolls &lt;die type&gt; and displays result.  Example: "Roll 1d6" would roll 1 6-sided die.<br />';
    socket.emit('output', { message: output });
  },
};
