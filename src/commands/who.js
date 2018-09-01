import Area from '../models/area';
import Room from '../models/room';
import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';

export default {
  name: 'who',
  desc: 'display the other players currently online',
  category: commandCategories.system,

  patterns: [
    /^who$/i,
  ],

  dispatch(socket) {
    this.execute().then(output => socketUtil.output(socket, output));
  },

  execute() {
    const characters = Object.values(global.io.sockets.connected)
      .filter(s => s.character).map(s => s.character);

    const whoUsers = characters.map(c => {
      const room = Room.getById(c.roomId);
      const areaName = room.areaId ? Area.getById(room.areaId).name : null;
      return {
        username: c.name,
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
    return Promise.resolve(output);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">who</span> <span class="purple">-</span> Display list of all connected players.<br />';
    socket.emit('output', { message: output });
  },
};
