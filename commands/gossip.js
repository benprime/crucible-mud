'use strict';

module.exports = {
  name: 'gossip',

  patterns: [
    /^gossip\s+?(.+)/i,
    /^gos\s+?(.+)/i
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, message) {

    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    const output = `<span class="silver">${socket.user.username} gossips: </span><span class="mediumOrchid">${safeMessage}</span>`;
    global.io.emit('output', { message: output });
  },

  help() {},
}
