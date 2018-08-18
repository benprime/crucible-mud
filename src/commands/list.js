import Room from '../models/room';

export default {
  name: 'list',

  patterns: [
    /^list$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {

    // check if room is a store.
    // list store inventory.

  },

  help(socket) {
    const output = '<span class="mediumOrchid">list </span><span class="purple">-</span> List store inventory.<br />';
    socket.emit('output', { message: output });
  },
};
