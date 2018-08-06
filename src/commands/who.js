export default {
  name: 'who',

  patterns: [
    /^who$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {
    const usernames = [];

    Object.keys(global.io.sockets.connected).forEach((socketId) => {
      let socket = global.io.sockets.connected[socketId];
      // check if user logged in
      if (socket.user) {
        usernames.push(socket.user.username);
      }
    });
    let output = `<span class="cyan"> -=- ${usernames.length} Players Online -=-</span><br />`;
    output += `<div class="mediumOrchid">${usernames.join('<br />')}</div>`;
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">who</span> <span class="purple">-</span> Display list of all connected players.<br />';
    socket.emit('output', { message: output });
  },
};
