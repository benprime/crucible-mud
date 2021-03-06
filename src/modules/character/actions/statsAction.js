export default {
  name: 'stats',
  execute(character) {
    let output = '';
    output += `<span class="cyan">Level: </span><span class="silver">${character.level}</span>  `;
    output += `<span class="cyan">XP: </span><span class="silver">${character.xp}</span>\n`;
    output += `<span class="cyan">HP: </span><span class="silver">${character.currentHP}/${character.maxHP}</span>\n`;
    output += `<span class="cyan">Action Die: </span><span class="silver">${character.actionDie}</span>\n`;
    output += `<span class="cyan">Armor: </span><span class="silver">${character.armorRating}</span>\n`;
    output += '<span class="yellow">Base Stats: </span>\n';
    output += `<span class="cyan">STR: </span><span class="silver">${character.stats.strength}</span>  `;
    output += `<span class="cyan">INT: </span><span class="silver">${character.stats.intelligence}</span>  `;
    output += `<span class="cyan">DEX: </span><span class="silver">${character.stats.dexterity}</span>\n`;
    output += `<span class="cyan">CHA: </span><span class="silver">${character.stats.charisma}</span>  `;
    output += `<span class="cyan">CON: </span><span class="silver">${character.stats.constitution}</span>  `;
    output += `<span class="cyan">Willpower: </span><span class="silver">${character.stats.willpower}</span>\n`;
    output += '<span class="yellow">Skills: </span>\n';
    output += `<span class="cyan">Stealth: </span><span class="silver">${character.skills.stealth}</span>  `;
    output += `<span class="cyan">Lockpicking: </span><span class="silver">${character.skills.lockpick}</span>\n`;
    output += `<span class="cyan">Pickpocketing: </span><span class="silver">${character.skills.pickpocket}</span>  `;
    output += `<span class="cyan">Searching: </span><span class="silver">${character.skills.search}</span>\n`;
    output += `<span class="cyan">Detecting: </span><span class="silver">${character.skills.detect}</span>  `;
    output += `<span class="cyan">Listening: </span><span class="silver">${character.skills.listen}</span>\n`;
    output += `<span class="cyan">Identifying: </span><span class="silver">${character.skills.identify}</span>  `;
    output += `<span class="cyan">Disabling: </span><span class="silver">${character.skills.disable}</span>\n`;
    output += `<span class="cyan">Negotiating: </span><span class="silver">${character.skills.negotiate}</span>  `;
    output += `<span class="cyan">Bluffing: </span><span class="silver">${character.skills.bluff}</span>\n`;
    output += `<span class="cyan">Intimidating: </span><span class="silver">${character.skills.intimidate}</span>  `;
    output += `<span class="cyan">Magic: </span><span class="silver">${character.skills.magic}</span>\n`;
    output += `<span class="cyan">Weapons: </span><span class="silver">${character.skills.weapons}</span>  `;
    output += `<span class="cyan">Concealing: </span><span class="silver">${character.skills.conceal}</span>\n`;
    output += `<span class="cyan">Healing: </span><span class="silver">${character.skills.heal}</span>  `;
    output += `<span class="cyan">Refreshing: </span><span class="silver">${character.skills.refresh}</span>\n`;
    output += `<span class="cyan">Endurance: </span><span class="silver">${character.skills.endure}</span>  `;
    output += `<span class="cyan">Resistance: </span><span class="silver">${character.skills.resist}</span>\n`;
    output += '<span class="yellow">Active Buffs/Debuffs: </span>\n';
    if (character.sneakMode) {
      output += '\n<span class="cyan">Sneaking </span>';
    }

    character.output(output);
    return true;
  },
};
