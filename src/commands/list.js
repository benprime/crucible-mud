import mobData from '../data/mobData';
import itemData from '../data/itemData';

export default {
  name: 'list',
  admin: true,

  // todo: this is going to need some kind of search parameter
  patterns: [
    /^list (mobs)$/i,
    /^list (items)$/i,
    /^list (keys)$/i,
    /^list$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      // todo: output the help
      socket.emit('output', { message: 'Invalid list usage.' });
      return;
    }

    const type = match[1].toLowerCase();

    if (type === 'items') {
      this.execute(socket, itemData, 'item');
    } else if (type === 'mobs') {
      this.execute(socket, mobData);
    } else if (type === 'keys') {
      this.execute(socket, itemData, 'key');
    } else {
      socket.emit('output', { message: 'Unknown catalog: {types}' });
      return;
    }

  },

  execute(socket, data, type) {

    let catalog;
    if (type) {
      catalog = data.catalog.filter(item => item.type === type);
    } else {
      catalog = data.catalog;
    }


    let output = '<table><tr><th>Name</th><th>Display Name</th></tr>';

    const listTable = catalog.map(({name, displayName}) => `<tr><td>${name}</td><td>${displayName}</td></tr>`).join('\n');
    output += listTable;

    output += '</table>';

    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">list mobs </span><span class="purple">-</span> Display info table of all valid mobs.<br />';
    output += '<span class="mediumOrchid">list items </span><span class="purple">-</span> Display info table of all valid items<br />';
    socket.emit('output', { message: output });
  },
};
