
export default {
  name: 'say',
  execute(character, message) {
    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    character.output(`You say "<span class="silver">${safeMessage}</span>"`);
    character.toRoom(`${character.name} says "<span class="silver">${safeMessage}</span>"`, [character.id]);
    return true;
  },
};
