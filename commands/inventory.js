'use strict';

module.exports = {
  name: 'inventory',

  patterns: [
    /^i$/i,
    /^inv$/i,
    /^inventory$/i
  ],

  dispatch(socket, match) {
    module.exports.execute(socket);
  },

  execute(socket) {

    let weaponMain = socket.user.inventory.find(i => i.id === socket.user.equipSlots.weaponMain);
   
    let invOutput = socket.user.inventory.map(item => item.displayName).join(', ');
    if (!invOutput) {
      invOutput = 'Nothing.';
    }

    let keyOutput = socket.user.keys.map(item => item.displayName).join(', ');
    if (!keyOutput) {
      keyOutput = 'None.';
    }

    let output = '<span class="cyan">Main Weapon: ${weaponMain || ""}</span>';
    output = '<span class="cyan">Backpack: </span>';
    output += `<span class="silver">${invOutput}</span>\n`;
    output += '<span class="cyan">Keys: </span>';
    output += `<span class="silver">${keyOutput}</span>`;
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">inventory </span><span class="purple">-</span> Display current inventory.<br />';
    socket.emit('output', { message: output });
  },
};
