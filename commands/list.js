'use strict';

const mobData = require('../data/mobData');
const itemData = require('../data/itemData');

module.exports = {
  name: 'list',
  admin: true,

  // todo: this is going to need some kind of search parameter
  patterns: [
    /^list (mobs)$/i,
    /^list (items)$/i,
    /^list$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      // todo: output the help
      socket.emit('output', { message: "Invalid list usage." });
      return;
    }
    if (match[1].toLowerCase() == 'items') {
      module.exports.execute(socket, itemData);
    } else if (match[1].toLowerCase() == 'mobs') {
      module.exports.execute(socket, mobData);
    } else {
      socket.emit('output', { message: `Unknown catalog: {match[1]}` });
      return;
    }

  },

  execute(socket, data) {
    let output = '<table><tr><th>Name</th><th>Display Name</th></tr>';

    const mobTable = data.catalog.map(item => `<tr><td>${item.name}</td><td>${item.displayName}</td></tr>`).join('\n');
    output += mobTable;

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
