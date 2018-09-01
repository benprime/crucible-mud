import mobData from '../data/mobData';
import itemData from '../data/itemData';
import Area from '../models/area';
import commandCategories from '../core/commandCategories';

export default {
  name: 'catalog',
  desc: 'list catalog of item types for use with spawn command',
  category: commandCategories.system,
  admin: true,

  patterns: [
    /^catalog (mobs)$/i,
    /^cat (mobs)$/i,
    /^catalog (items)$/i,
    /^cat (items)$/i,
    /^catalog (keys)$/i,
    /^cat (keys)$/i,
    /^catalog (areas)$/i,
    /^cat (areas)$/i,
    /^catalog$/i,
    /^catalog\s.*$/i,
    /^cat$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      this.help(socket);
      return;
    }

    const type = match[1].toLowerCase();

    if (type === 'items') {
      return this.execute(socket, itemData, 'item');
    } else if (type === 'mobs') {
      return this.execute(socket, mobData);
    } else if (type === 'keys') {
      return this.execute(socket, itemData, 'key');
    } else if (type === 'areas') {
      const areas = Object.values(Area.areaCache);
      return this.execute(socket, areas);
    } else {
      socket.emit('output', { message: 'Unknown catalog: {types}' });
      return;
    }
  },

  execute(socket, data, type) {

    let catalog;
    if (type) {
      catalog = data.catalog.filter(item => item.type === type);
    } else if (data.catalog) {
      catalog = data.catalog;
    } else {
      catalog = data;
    }

    let output = '<table><tr><th>Name</th></tr>';

    const listTable = catalog.map(({ name }) => `<tr><td>${name}</td></tr>`).join('\n');
    output += listTable;

    output += '</table>';

    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">[catalog|cat] mobs </span><span class="purple">-</span> Display info table of all valid mobs<br />';
    output += '<span class="mediumOrchid">[catalog|cat] items </span><span class="purple">-</span> Display info table of all valid items<br />';
    output += '<span class="mediumOrchid">[catalog|cat] keys </span><span class="purple">-</span> Display info table of all valid keys<br />';
    output += '<span class="mediumOrchid">[catalog|cat] areas </span><span class="purple">-</span> Display info table of all valid areas<br />';
    socket.emit('output', { message: output });
  },
};
