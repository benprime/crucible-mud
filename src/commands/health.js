import socketUtil from '../core/socketUtil';

export default {
  name: 'stats',
  desc: 'display your current hit points and wounded level',

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
    
    const quotient = character.currentHP / character.maxHP;
    let status = 'unharmed';

    if(quotient <= 0) {
      status = 'incapacitated';
    }
    if(quotient <= 0.25) {
      status = 'critically wounded';
    }
    if(quotient <= 0.50) {
      status = 'severely wounded';
    }
    if(quotient <= 0.75) {
      status = 'moderately wounded';
    }
    if(quotient < 1) {
      status = 'lightly wounded';
    }

    output += `You are ${status}.\n`;

    return Promise.resolve(output);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">health </span><span class="purple">-</span> Display your current health status.<br />';
    socket.emit('output', { message: output });
  },
};
