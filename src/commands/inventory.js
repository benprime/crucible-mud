import { currencyToString } from '../core/currency';

export default {
  name: 'inventory',

  patterns: [
    /^i$/i,
    /^inv$/i,
    /^inventory$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {

    let output = '';
    if (socket.character.equipSlots.weaponMain) output += `<span class="cyan">Main Weapon: </span><span class="silver">${socket.character.equipSlots.weaponMain.displayName}</span>\n`;
    if (socket.character.equipSlots.weaponOff) output += `<span class="cyan">Offhand Weapon: </span><span class="silver">${socket.character.equipSlots.weaponOff.displayName}</span>\n`;
    if (socket.character.equipSlots.head) output += `<span class="cyan">Head: </span><span class="silver">${socket.character.equipSlots.head.displayName}</span>\n`;
    if (socket.character.equipSlots.body) output += `<span class="cyan">Body: </span><span class="silver">${socket.character.equipSlots.body.displayName}</span>\n`;
    if (socket.character.equipSlots.back) output += `<span class="cyan">Back: </span><span class="silver">${socket.character.equipSlots.back.displayName}</span>\n`;
    if (socket.character.equipSlots.legs) output += `<span class="cyan">Legs: </span><span class="silver">${socket.character.equipSlots.legs.displayName}</span>\n`;
    if (socket.character.equipSlots.feet) output += `<span class="cyan">Feet: </span><span class="silver">${socket.character.equipSlots.feet.displayName}</span>\n`;
    if (socket.character.equipSlots.arms) output += `<span class="cyan">Arms: </span><span class="silver">${socket.character.equipSlots.arms.displayName}</span>\n`;
    if (socket.character.equipSlots.hands) output += `<span class="cyan">Hands: </span><span class="silver">${socket.character.equipSlots.hands.displayName}</span>\n`;
    if (socket.character.equipSlots.neck) output += `<span class="cyan">Neck: </span><span class="silver">${socket.character.equipSlots.neck.displayName}</span>\n`;
    if (socket.character.equipSlots.fingerMain) output += `<span class="cyan">Main Hand Finger: </span><span class="silver">${socket.character.equipSlots.fingerMain.displayName}</span>\n`;
    if (socket.character.equipSlots.fingerOff) output += `<span class="cyan">Off Hand Finger: </span><span class="silver">${socket.character.equipSlots.fingerOff.displayName}</span>\n`;

    let invOutput = socket.character.inventory.map(({ displayName }) => displayName).join(', ');
    if (!invOutput) {
      invOutput = 'Empty';
    }
    output += '<span class="cyan">Backpack: </span>';
    output += `<span class="silver">${invOutput}</span>\n`;

    let keyOutput = socket.character.keys.map(({ displayName }) => displayName).join(', ');
    if (keyOutput) {
      output += '<span class="cyan">Keys: </span>';
      output += `<span class="silver">${keyOutput}</span>\n`;
    }

    output += '<span class="cyan">Currency: </span>';
    output += `<span class="silver">${currencyToString(socket.character.currency)}</span>\n`;
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">inventory </span><span class="purple">-</span> Display current inventory.<br />';
    socket.emit('output', { message: output });
  },
};
