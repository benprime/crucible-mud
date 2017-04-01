'use strict';

var mobData = require('../data/mobData');

module.exports = {
  name: 'list',

  patterns: [],


  dispatch(socket, match) {
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
}
