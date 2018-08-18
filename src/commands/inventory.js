function CurrencyChangeToString(totalCurr) {
  if (totalCurr < 0) return 'You are in debt';
  if (totalCurr == 0) return '0 Copper';

  let currStr = '';
  let t = totalCurr;

  let pp = Math.floor(t / 1000);
  t -= pp * 1000;
  let gp = Math.floor(t / 100);
  t -= gp * 100;
  let sp = Math.floor(t / 10);
  t -= sp * 10;
  let cp = Math.floor(t / 1);
  t -= cp * 1;

  if (pp > 0) currStr += `${pp} Platinum `;
  if (gp > 0) currStr += `${gp} Gold `;
  if (sp > 0) currStr += `${sp} Silver `;
  if (cp > 0) currStr += `${cp} Copper`;

  return currStr;
}

/*
function CurrencyChangeToInt(currStr) {
  if (!currStr) return 'No currency text';

  let parts = currStr.spltest(' ');
  let totalCurr = 0;

  if (parts.length == 1 && Number.isInteger(parts[x])) return parts[x];

  for (var x = 0; x < parts.length - 1; x += 2) {
    if (parts[x] === 0) continue;
    if (!Number.isInteger(parts[x])) return 0;

    if (parts[x + 1].toLowerCase() === 'platinum'
      || parts[x + 1].toLowerCase() === 'plat'
      || parts[x + 1].toLowerCase() === 'pp'
      || parts[x + 1].toLowerCase() === 'p') {
      totalCurr += parts[x] * 1000;
    }
    else if (parts[x + 1].toLowerCase() === 'gold'
      || parts[x + 1].toLowerCase() === 'gp'
      || parts[x + 1].toLowerCase() === 'g') {
      totalCurr += parts[x] * 100;
    }
    else if (parts[x + 1].toLowerCase() === 'silver'
      || parts[x + 1].toLowerCase() === 'silv'
      || parts[x + 1].toLowerCase() === 'sp'
      || parts[x + 1].toLowerCase() === 's') {
      totalCurr += parts[x] * 10;
    }
    else if (parts[x + 1].toLowerCase() === 'copper'
      || parts[x + 1].toLowerCase() === 'copp'
      || parts[x + 1].toLowerCase() === 'cp'
      || parts[x + 1].toLowerCase() === 'c') {
      totalCurr += parts[x] * 1;
    }
  }

  return totalCurr;
}
*/

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

    let invOutput = socket.character.inventory.map(({displayName}) => displayName).join(', ');
    if (!invOutput) {
      invOutput = 'Empty';
    }
    output += '<span class="cyan">Backpack: </span>';
    output += `<span class="silver">${invOutput}</span>\n`;

    let keyOutput = socket.character.keys.map(({displayName}) => displayName).join(', ');
    if (keyOutput) {
      output += '<span class="cyan">Keys: </span>';
      output += `<span class="silver">${keyOutput}</span>\n`;
    }

    output += '<span class="cyan">Currency: </span>';
    output += `<span class="silver">${CurrencyChangeToString(socket.character.currency)}</span>\n`;
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">inventory </span><span class="purple">-</span> Display current inventory.<br />';
    socket.emit('output', { message: output });
  },
};
