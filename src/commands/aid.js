import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'aid',
  desc: 'Assist a player who has been incapacitated',
  category: commandCategories.combat,

  patterns: [
    /^aid\s+(\w+)$/i,
    /^aid\s.+$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      this.help(socket);
      return;
    }
    return this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character, username) {

    const targetPlayer = autocomplete.character(character, username);
    if (!targetPlayer) {
      return Promise.reject('unknown player.');
    }

    if (targetPlayer.roomId !== character.roomId) {
      return Promise.reject('That player doesn\'t appear to be in the room.');
    }

    if (!targetPlayer.bleeding) {
      return Promise.reject(`${targetPlayer.name} is not in need of your assistance.`);
    }

    targetPlayer.bleeding = false;
    targetPlayer.output(`<span class="yellow">${character.name} bandages your wounds and stops the bleeding.</span>`);
    character.toRoom(`<span class="silver">${character.name} bandages ${targetPlayer.name}'s wounds, stopping the bleeding.</span>`, [targetPlayer.id]);
    character.output(`<span class="silver">You bandage ${targetPlayer.name}'s wounds and the bleeding stops.</span>`);

    return Promise.resolve();
  },

  help(socket) {
    const output = '<span class="mediumOrchid">aid &lt;player&gt; </span><span class="purple">-</span> Bandage a player that recently been incapacitated.<br />';
    socket.emit('output', { message: output });
  },
};
