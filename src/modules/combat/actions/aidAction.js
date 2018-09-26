export default {
  name: 'aid',
  execute(character, targetPlayer) {

    if (!targetPlayer) {
      character.output('You don\'t see anyone by that name here!');
      return Promise.reject();
    }

    if (targetPlayer.roomId !== character.roomId) {
      character.output('That player doesn\'t appear to be in the room.');
      return Promise.reject();
    }

    if (!targetPlayer.bleeding) {
      character.output(`${targetPlayer.name} is not in need of your assistance.`);
      return Promise.reject();
    }

    targetPlayer.bleeding = false;
    targetPlayer.output(`<span class="yellow">${character.name} bandages your wounds and stops the bleeding.</span>`);
    character.toRoom(`<span class="silver">${character.name} bandages ${targetPlayer.name}'s wounds, stopping the bleeding.</span>`, [targetPlayer.id]);
    character.output(`<span class="silver">You bandage ${targetPlayer.name}'s wounds and the bleeding stops.</span>`);

    return Promise.resolve();
  },
};
