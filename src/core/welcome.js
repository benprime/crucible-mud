export default {
  WelcomeMessage(socket) {
    socket.emit('output', { message: 'Connected.' });
    socket.emit('output', { message: '<br><span class="mediumOrchid">Welcome to CrucibleMUD!</span><br>' });
  },
};
