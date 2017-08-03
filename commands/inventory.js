'use strict';

module.exports = {
  name: 'inventory',

  patterns: [
    /^i$/i,
    /^inv$/i,
    /^inventory$/i,
  ],

  dispatch(socket) {
    module.exports.execute(socket);
  },

  execute(socket) {

    //let weaponMain = socket.user.inventory.find(i => i.id === socket.user.equipSlots.weaponMain);
   
    let invOutput = socket.user.inventory.map(item => item.displayName).join(', ');
    if (!invOutput) {
      invOutput = 'Nothing.';
    }

    let keyOutput = socket.user.keys.map(item => item.displayName).join(', ');
    if (!keyOutput) {
      keyOutput = 'None.';
    }

    let output = '';
    if(socket.user.equipSlots.weaponMain) output += `<span class="cyan">Main Weapon: </span><span class="silver">${socket.user.equipSlots.weaponMain.displayName}</span>\n`;
    if(socket.user.equipSlots.weaponOff) output += `<span class="cyan">Offhand Weapon: </span><span class="silver">${socket.user.equipSlots.weaponOff.displayName}</span>\n`;
    if(socket.user.equipSlots.head) output += `<span class="cyan">Head: </span><span class="silver">${socket.user.equipSlots.head.displayName}</span>\n`;
    if(socket.user.equipSlots.body) output += `<span class="cyan">Body: </span><span class="silver">${socket.user.equipSlots.body.displayName}</span>\n`;
    if(socket.user.equipSlots.back) output += `<span class="cyan">Back: </span><span class="silver">${socket.user.equipSlots.back.displayName}</span>\n`;
    if(socket.user.equipSlots.legs) output += `<span class="cyan">Legs: </span><span class="silver">${socket.user.equipSlots.legs.displayName}</span>\n`;
    if(socket.user.equipSlots.feet) output += `<span class="cyan">Feet: </span><span class="silver">${socket.user.equipSlots.feet.displayName}</span>\n`;
    if(socket.user.equipSlots.arms) output += `<span class="cyan">Arms: </span><span class="silver">${socket.user.equipSlots.arms.displayName}</span>\n`;
    if(socket.user.equipSlots.hands) output += `<span class="cyan">Hands: </span><span class="silver">${socket.user.equipSlots.hands.displayName}</span>\n`;
    if(socket.user.equipSlots.neck) output += `<span class="cyan">Neck: </span><span class="silver">${socket.user.equipSlots.neck.displayName}</span>\n`;
    if(socket.user.equipSlots.fingerMain) output += `<span class="cyan">Main Hand Finger: </span><span class="silver">${socket.user.equipSlots.fingerMain.displayName}</span>\n`;
    if(socket.user.equipSlots.fingerOff) output += `<span class="cyan">Off Hand Finger: </span><span class="silver">${socket.user.equipSlots.fingerOff.displayName}</span>\n`;
    output += '<span class="cyan">Backpack: </span>';
    output += `<span class="silver">${invOutput}</span>\n`;
    output += '<span class="cyan">Keys: </span>';
    output += `<span class="silver">${keyOutput}</span>\n`;
    output += '<span class="cyan">Currency: </span>';
    output += `<span class="silver">${socket.user.currency}</span>\n`;
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">inventory </span><span class="purple">-</span> Display current inventory.<br />';
    socket.emit('output', { message: output });
  },
};
