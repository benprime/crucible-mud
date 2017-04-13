'use strict';

var mobData = require('../data/mobData');

module.exports = {
  name: 'list',
  admin: true,

  // todo: this is going to need some kind of search parameter
  patterns: [
    /^list (mobs)$/i,
    /^list (items)$/i,
    /^list\s?/i,
  ],

  dispatch(socket, match) {
    if(match.length != 2) {
      // todo: output the help
      socket.emit('output', { message: "Invalid list usage." });
      return;
    }
    module.exports.execute(socket);
  },

  execute(socket, input) {

    let output = '<table><tr><th>Name</th><th>Display Name</th></tr>';

    const mobTable = mobData.catalog.map(mob => `<tr><td>${mob.name}</td><td>${mob.displayName}</td></tr>`).join('\n');
    output += mobTable;

    output += '</table>';
    //console.log(output);

    socket.emit('output', { message: output });
  },

  help() {},
};
