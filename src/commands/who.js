import Area from '../models/area';
import Room from '../models/room';
import commandCategories from '../core/commandCategories';

export default {
  name: 'who',
  desc: 'display the other players currently online',
  category: commandCategories.system,

  patterns: [
    /^who$/i,
  ],

  dispatch(socket) {
    return this.execute(socket.character);
  },

  execute(character) {
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
    character.output(output);
    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">who</span> <span class="purple">-</span> Display list of all connected players.<br />';
    character.output(output);
  },
};
