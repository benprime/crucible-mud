import socketUtil from '../core/socketUtil';
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
      this.help(socket);
      return;
    }

    this.execute(socket.character, match[1], match[2])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(toCharacter, fromCharName) {
    // autocomplete username
    const fromCharacter = autocomplete.character(toCharacter, fromCharName);
    if (!fromCharacter) {
      return Promise.reject(`${fromCharName} is not here!`);
    }

    if (toCharacter.roomId !== fromCharacter.roomId) {
      return Promise.reject(`${fromCharName} is not here!`);
    }

    const offer = toCharacter.offers.find(o => o.fromUserName === fromCharacter.name);
    if (!offer) {
      return Promise.reject(`There are no offers from ${fromCharacter.name}.`);
    }

    if (offer.currency) {
      // check if offering user's funds have changed since the offer was made
      if (fromCharacter.currency < offer.currency) {
        toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName !== fromCharacter.name);
        return Promise.reject(`${fromCharacter.username} no longer has enough money to complete this offer.`);
      }
      fromCharacter.currency -= offer.currency;
      toCharacter.currency += offer.currency;
    } else {
      // check that offering user still has item when it is accepted
      const item = fromCharacter.inventory.id(offer.item.id);
      if (!item) {
        toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName !== fromCharacter.name);
        return Promise.reject(`${fromCharacter.name} no longer has the offered item in their inventory.`);
      }
      fromCharacter.inventory.id(offer.item.id).remove();
      toCharacter.inventory.push(item);
    }
    toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName !== fromCharacter.name);
    fromCharacter.save(err => { if (err) throw err; });
    toCharacter.save(err => { if (err) throw err; });

    // format feedback messages
    let fromCharacterMessage;
    let toCharacterMessage;
    if (offer.currency) {
      fromCharacterMessage = `${toCharacter.name} accepts your offer of ${currencyToString(offer.currency)}.`;
      toCharacterMessage = `You accept the offer of ${currencyToString(offer.currency)} from ${fromCharacter.name}.`;
    } else {
      fromCharacterMessage = `${toCharacter.name} accepts the ${offer.item.name}.`;
      toCharacterMessage = `You accept the ${offer.item.name} from ${fromCharacter.name}.`;
    }

    return Promise.resolve({
      charMessages: [
        { charId: fromCharacter.id, message: fromCharacterMessage },
        { charId: toCharacter.id, message: toCharacterMessage },
      ],
    });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">accept offer &lt;player&gt; </span><span class="purple">-</span> Accept an offer from another player.<br />';
    socket.emit('output', { message: output });
  },
};
