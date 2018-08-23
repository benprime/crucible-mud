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
      const room = Room.getById(s.character.roomId);
      const areaName = room.areaId ? Area.getById(room.areaId).name : null;
      return {
        username: s.user.username,
        areaName: areaName,
      };
    });

    let output = `<span class="cyan"> -=- ${whoUsers.length} Players Online -=-</span><br />`;
    output += '<div class="mediumOrchid">';
    whoUsers.forEach(wu => {
      let areaName = wu.areaName ? ` (${wu.areaName})` : '';
      output += `${wu.username}${areaName}<br />`;
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
