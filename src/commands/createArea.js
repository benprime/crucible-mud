import Area from '../models/area';
import commandCategories from '../core/commandCategories';

export default {
  name: 'create area',
  desc: 'creates a map area',
  category: commandCategories.world,
  admin: true,

  patterns: [
    /^create\s+(area)\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    let param = match[2];
    return this.execute(socket.character, param);
  },

  execute(character, param) {
    let area = Area.getByName(param);
    if (area) {
      character.output(`Area already exists: ${area.id}`);
      return Promise.reject();
    }
    Area.addArea(param);
    return Promise.resolve('Area created.');
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create area </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
