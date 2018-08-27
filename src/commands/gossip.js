export default Object.freeze({
  name: 'gossip',

  patterns: [
    /^gossip\s+?(.+)/i,
    /^gos\s+?(.+)/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1]);
  },

  execute(character, message) {

    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    const output = `<span class="silver">${character.name} gossips: </span><span class="mediumOrchid">${safeMessage}</span>`;
    global.io.to('gossip').emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">gossip &lt;message&gt; </span><span class="purple">-</span> Send messages to all connected players.<br />';
    socket.emit('output', { message: output });
  },
});
