import { SocketExt } from "./socketUtil";

export default {
  WelcomeMessage(socket: SocketExt) {
    socket.emit('output', { message: 'Connected.' });
    socket.emit('output', { message: '<br><span class="mediumOrchid">Welcome to CrucibleMUD!</span><br>' });
  },
};
