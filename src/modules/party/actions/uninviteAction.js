export default {
  name: 'uninvite',
  execute(character, targetChar) {

    if (!targetChar) {
      character.output('Unknown player.');
      return false;
    }

    if (targetChar.leader !== character.id) {
      character.output(`You are not leading ${targetChar.name} in a party.`);
      return false;
    }

    const partyMsg = `<span class="yellow">${targetChar.name} has been removed from ${character.name}'s party.\n`;
    targetChar.toParty(partyMsg);
    targetChar.leader = undefined;
    return true;
  },
};
