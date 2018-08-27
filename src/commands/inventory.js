import { currencyToString } from '../core/currency';

export default {
  name: 'inventory',

  patterns: [
    /^i$/i,
    /^inv$/i,
    /^inventory$/i,
  ],

  dispatch(socket) {
    this.execute(socket.character)
      .then(output => socket.emit('output', { message: output }));
  },

  execute(character) {

    let output = '';
    if (character.equipped.weaponMain) output += `<span class="cyan">Main Weapon: </span><span class="silver">${character.inventory.id(character.equipped.weaponMain).displayName}</span>\n`;
    if (character.equipped.weaponOff) output += `<span class="cyan">Offhand Weapon: </span><span class="silver">${character.inventory.id(character.equipped.weaponOff).displayName}</span>\n`;
    if (character.equipped.head) output += `<span class="cyan">Head: </span><span class="silver">${character.inventory.id(character.equipped.head).displayName}</span>\n`;
    if (character.equipped.body) output += `<span class="cyan">Body: </span><span class="silver">${character.inventory.id(character.equipped.body).displayName}</span>\n`;
    if (character.equipped.back) output += `<span class="cyan">Back: </span><span class="silver">${character.inventory.id(character.equipped.back).displayName}</span>\n`;
    if (character.equipped.legs) output += `<span class="cyan">Legs: </span><span class="silver">${character.inventory.id(character.equipped.legs).displayName}</span>\n`;
    if (character.equipped.feet) output += `<span class="cyan">Feet: </span><span class="silver">${character.inventory.id(character.equipped.feet).displayName}</span>\n`;
    if (character.equipped.arms) output += `<span class="cyan">Arms: </span><span class="silver">${character.inventory.id(character.equipped.arms).displayName}</span>\n`;
    if (character.equipped.hands) output += `<span class="cyan">Hands: </span><span class="silver">${character.inventory.id(character.equipped.hands).displayName}</span>\n`;
    if (character.equipped.neck) output += `<span class="cyan">Neck: </span><span class="silver">${character.inventory.id(character.equipped.neck).displayName}</span>\n`;
    if (character.equipped.fingerMain) output += `<span class="cyan">Main Hand Finger: </span><span class="silver">${character.inventory.id(character.equipped.fingerMain).displayName}</span>\n`;
    if (character.equipped.fingerOff) output += `<span class="cyan">Off Hand Finger: </span><span class="silver">${character.inventory.id(character.equipped.fingerOff).displayName}</span>\n`;

    let invOutput = character.inventory.filter(i => !character.equipped.isEquipped(i)).map(({ displayName }) => displayName).join(', ');
    if (!invOutput) {
      invOutput = 'Empty';
    }
    output += '<span class="cyan">Backpack: </span>';
    output += `<span class="silver">${invOutput}</span>\n`;

    let keyOutput = character.keys.map(({ displayName }) => displayName).join(', ');
    if (keyOutput) {
      output += '<span class="cyan">Keys: </span>';
      output += `<span class="silver">${keyOutput}</span>\n`;
    }

    output += '<span class="cyan">Currency: </span>';
    output += `<span class="silver">${currencyToString(character.currency)}</span>\n`;
    return Promise.resolve(output);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">inventory </span><span class="purple">-</span> Display current inventory.<br />';
    socket.emit('output', { message: output });
  },
};
