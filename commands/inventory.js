'use strict';

module.exports = {
  name: "inventory",

  patterns: [
    /^i$/i,
    /^inv$/i,
    /^inventory$/i
  ],

  dispatch(socket, match) {},

  execute(socket, input) {
    console.log(socket.inventory);
    const inv = socket.inventory || [];
    let invOutput = inv.map(item => item.name).join(', ');
    console.log(invOutput);
    if (!invOutput) {
      invOutput = 'Nothing.';
    }

    let output = '<span class="cyan">You are carrying: </span>';
    output += '<span class="silver">';
    output += invOutput;
    output += '</span>';
    socket.emit('output', { message: output });
  },

  help() {},
}
