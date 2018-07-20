module.exports = {
  name: 'keys',

  patterns: [
    /^keys$/i,
  ],

  dispatch(socket) {
    module.exports.execute(socket);
  },

  execute(socket) {
    const keys = socket.user.keys || [];
    let keyOutput = keys.map(item => item.displayName).join(', ');
    if (!keyOutput) {
      keyOutput = 'None.';
    }

    let output = '<span class=\'cyan\'>Key ring: </span>';
    output += '<span class=\'silver\'>';
    output += keyOutput;
    output += '</span>';
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">keys </span><span class="purple">-</span> Display keys on your key ring.<br />';
    socket.emit('output', { message: output });
  },
};
