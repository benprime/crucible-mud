import autocomplete from '../core/autocomplete';
import { currencyToString } from '../core/currency';
import commandCategories from '../core/commandCategories';

export default {
  name: 'accept',
  desc: 'accept offered currency or item from another player',
  category: commandCategories.item,

  patterns: [
    /^accept\s+offer\s+(\w+)$/i,
    /^accept\s.*$/i,
    /^accept$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      this.help(socket.character);
      return Promise.resolve();
    }

    return this.execute(socket.character, match[1], match[2]);
  },

  execute(character, fromCharName) {
    // autocomplete username
    const fromCharacter = autocomplete.character(character, fromCharName);
    if (!fromCharacter) {
      character.output(`${fromCharName} is not here!`);
      return Promise.reject();
    }

    if (character.roomId !== fromCharacter.roomId) {
      character.output(`${fromCharName} is not here!`);
      return Promise.reject();
    }

    const offer = character.offers.find(o => o.fromUserName === fromCharacter.name);
    if (!offer) {
      character.output(`There are no offers from ${fromCharacter.name}.`);
      return Promise.reject();
    }

    if (offer.currency) {
      // check if offering user's funds have changed since the offer was made
      if (fromCharacter.currency < offer.currency) {
        character.offers = character.offers.filter(o => o.fromUserName !== fromCharacter.name);
        character.output(`${fromCharacter.username} no longer has enough money to complete this offer.`);
        return Promise.reject();
      }
      fromCharacter.currency -= offer.currency;
      character.currency += offer.currency;
    } else {
      // check that offering user still has item when it is accepted
      const item = fromCharacter.inventory.id(offer.item.id);
      if (!item) {
        character.offers = character.offers.filter(o => o.fromUserName !== fromCharacter.name);
        character.output(`${fromCharacter.name} no longer has the offered item in their inventory.`);
        return Promise.reject();
      }
      fromCharacter.inventory.id(offer.item.id).remove();
      character.inventory.push(item);
    }
    character.offers = character.offers.filter(o => o.fromUserName !== fromCharacter.name);
    fromCharacter.save(err => { if (err) throw err; });
    character.save(err => { if (err) throw err; });

    // format feedback messages
    let fromCharacterMessage;
    let toCharacterMessage;
    if (offer.currency) {
      fromCharacterMessage = `${character.name} accepts your offer of ${currencyToString(offer.currency)}.`;
      toCharacterMessage = `You accept the offer of ${currencyToString(offer.currency)} from ${fromCharacter.name}.`;
    } else {
      fromCharacterMessage = `${character.name} accepts the ${offer.item.name}.`;
      toCharacterMessage = `You accept the ${offer.item.name} from ${fromCharacter.name}.`;
    }

    fromCharacter.output(fromCharacterMessage);
    character.output(toCharacterMessage);
    return Promise.resolve();
  },

  help(character) {
    const output = '<span class="mediumOrchid">accept offer &lt;player&gt; </span><span class="purple">-</span> Accept an offer from another player.<br />';
    character.output(output);
  },
};
