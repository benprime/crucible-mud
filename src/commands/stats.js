'use strict';

module.exports = {
  name: 'stats',

  patterns: [
    /^stats$/i,
  ],

  dispatch(socket) {
    module.exports.execute(socket);
  },

  execute(socket) {
    let output = '';
    output += `<span class="cyan">Level: </span><span class="silver">${socket.user.level}</span>  `;
    output += `<span class="cyan">XP: </span><span class="silver">${socket.user.xp}</span>\n`;
    output += `<span class="cyan">HP: </span><span class="silver">${socket.user.currentHP}/${socket.user.maxHP}</span>\n`;
    output += `<span class="cyan">Action Die: </span><span class="silver">${socket.user.actionDie}</span>\n`;
    output += `<span class="cyan">Armor: </span><span class="silver">${socket.user.armorRating}</span>\n`;
    output += '<span class="yellow">Base Stats: </span>\n';
    output += `<span class="cyan">STR: </span><span class="silver">${socket.user.strength}</span>  `;
    output += `<span class="cyan">INT: </span><span class="silver">${socket.user.intelligence}</span>  `;
    output += `<span class="cyan">DEX: </span><span class="silver">${socket.user.dexterity}</span>\n`;
    output += `<span class="cyan">CHA: </span><span class="silver">${socket.user.charisma}</span>  `;
    output += `<span class="cyan">CON: </span><span class="silver">${socket.user.constitution}</span>  `;
    output += `<span class="cyan">Willpower: </span><span class="silver">${socket.user.willpower}</span>\n`;
    output += '<span class="yellow">Skills: </span>\n';
    output += `<span class="cyan">Stealth: </span><span class="silver">${socket.user.stealth}</span>  `;
    output += `<span class="cyan">Lockpicking: </span><span class="silver">${socket.user.lockpick}</span>\n`;
    output += `<span class="cyan">Pickpocketing: </span><span class="silver">${socket.user.pickpocket}</span>  `;
    output += `<span class="cyan">Searching: </span><span class="silver">${socket.user.search}</span>\n`;
    output += `<span class="cyan">Detecting: </span><span class="silver">${socket.user.detect}</span>  `;
    output += `<span class="cyan">Listening: </span><span class="silver">${socket.user.listen}</span>\n`;
    output += `<span class="cyan">Identifying: </span><span class="silver">${socket.user.identify}</span>  `;
    output += `<span class="cyan">Disabling: </span><span class="silver">${socket.user.disable}</span>\n`;
    output += `<span class="cyan">Negotiating: </span><span class="silver">${socket.user.negotiate}</span>  `;
    output += `<span class="cyan">Bluffing: </span><span class="silver">${socket.user.bluff}</span>\n`;
    output += `<span class="cyan">Intimidating: </span><span class="silver">${socket.user.intimidate}</span>  `;
    output += `<span class="cyan">Magic: </span><span class="silver">${socket.user.magic}</span>\n`;
    output += `<span class="cyan">Weapons: </span><span class="silver">${socket.user.weapons}</span>  `;
    output += `<span class="cyan">Concealing: </span><span class="silver">${socket.user.conceal}</span>\n`;
    output += `<span class="cyan">Healing: </span><span class="silver">${socket.user.heal}</span>  `;
    output += `<span class="cyan">Refreshing: </span><span class="silver">${socket.user.refresh}</span>\n`;
    output += `<span class="cyan">Endurance: </span><span class="silver">${socket.user.endure}</span>  `;
    output += `<span class="cyan">Resistance: </span><span class="silver">${socket.user.resist}</span>\n`;
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">stats </span><span class="purple">-</span> Display current character stats.<br />';
    socket.emit('output', { message: output });
  },
};
