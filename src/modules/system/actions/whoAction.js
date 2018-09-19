import Area from '../../../models/area';
import Room from '../../../models/room';

export default {
  name: 'who',
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

};
