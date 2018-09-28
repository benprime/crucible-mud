import autocomplete from '../../../core/autocomplete';

export default {
  name: 'telepathy',
  execute(character, username, message) {

    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    // party chat
    if (username.toLowerCase() === 'par' || username.toLowerCase() === 'party') {
      return character.toParty(`<span class="olive">[Party Chat]</span> ${character.name}: <span class="silver">${safeMessage}</span>`);
    }

    // player to player chat
    const targetCharacter = autocomplete.character(character, username);
    if (!targetCharacter) {
      character.output('Invalid username.');
      return Promise.reject();
    }

    targetCharacter.output(`${character.name} telepaths: <span class="silver">${safeMessage}</span>`);
    character.output(`Telepath to ${targetCharacter.name}: <span class="silver">${safeMessage}</span>`);

    return Promise.resolve();
  },

};
