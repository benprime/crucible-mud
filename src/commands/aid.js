import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'aid',
  desc: 'Assist a player who has been incapacitated',
  category: commandCategories.combat,

  patterns: [
    /^aid\s+(\w+)$/i,
    /^aid\s.+$/i,
    /^aid$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      this.help(socket.character);
      return Promise.resolve();
    }
    return this.execute(socket.character, match[1]);
  },

  execute(character, username) {

    const targetPlayer = autocomplete.character(character, username);
    if (!targetPlayer) {
      character.output('unknown player.');
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

  help(character) {
    const output = '<span class="mediumOrchid">aid &lt;player&gt; </span><span class="purple">-</span> Bandage a player that recently been incapacitated.<br />';
    character.output(output);
  },
};
