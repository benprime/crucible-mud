import Area from '../models/area';
import Room from '../models/room';

export default {
  name: 'who',

  patterns: [
    /^who$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {
    const sockets = Object.values(global.io.sockets.connected)
      .filter(s => s.user);

    const whoUsers = sockets.map(s => {
      const room = Room.getById(s.user.roomId);
      const area = room.area ? Area.getById(room.area).name : null;
      return {
        username: s.user.username,
        area: area,
      };
    });

    let output = `<span class="cyan"> -=- ${whoUsers.length} Players Online -=-</span><br />`;
    output += '<div class="mediumOrchid">';
    whoUsers.forEach(wu => {
      let area = wu.area ? ` (${wu.area})` : '';
      output += `${wu.username}${area}<br />`;
    });
    output += '</div>';
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">who</span> <span class="purple">-</span> Display list of all connected players.<br />';
    socket.emit('output', { message: output });
  },
};
