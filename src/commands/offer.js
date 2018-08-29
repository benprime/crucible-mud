import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import { currencyToInt, currencyToString } from '../core/currency';

export default {
  name: 'offer',
  desc: 'offer an item to another player',

  patterns: [
    /^offer\s+(.+)\s+to\s+(.+)$/i,
    /^off\s+(.+)\s+to\s+(.+)$/i,
    /^offer\s.*$/i,
    /^offer$/i,
    /^off\s.*$/i,
    /^off$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 3) {
      this.help(socket);
      return;
    }
    this.execute(socket.character, match[1], match[2])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, itemName, userName) {
    let item = null;

    // autocomplete username
    const toCharacter = autocomplete.character(character, userName);
    if (!toCharacter) {
      return Promise.reject('Unknown user or user not connected.');
    }

    if (toCharacter.roomId !== character.roomId) {
      return Promise.reject(`${userName} is not here!`);
    }

    // check if the offer is currency
    const currencyValue = currencyToInt(itemName);
    if (currencyValue) {
      if (character.currency < currencyValue) {
        toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName !== character.name);
        return Promise.reject('You do not have enough money.');
      }
    } else {
      const acResult = autocomplete.multiple(character, ['inventory'], itemName);
      if (!acResult) {
        return Promise.reject('You don\'t seem to be carrying that.');
      }
      item = acResult.item;
    }

    // build offer
    const offer = {
      fromUserName: character.name,
      toUserName: userName,
      item: item,
      currency: currencyValue,
    };

    // a player can only offer one item or amount to another player
    toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName != character.name);
    toCharacter.offers.push(offer);

    // set an expiration of 60 seconds for this offer
    setTimeout(() => {
      toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName != character.name);
    }, 60000);

    // format and emit feedback messages
    let offerMessage;
    let feedbackMessage;
    if (currencyValue) {
      offerMessage = `${character.name} offers you ${currencyToString(currencyValue)}`;
      feedbackMessage = `You offer ${currencyToString(currencyValue)} to ${userName}.`;
    } else {
      offerMessage = `${character.name} offers you a ${itemName}.`;
      feedbackMessage = `You offer your ${itemName} to ${userName}.`;
    }
    offerMessage += `\nTo accept the offer: accept offer ${character.name}`;

    return Promise.resolve({
      charMessages: [
        { charId: toCharacter.id, message: offerMessage },
        { charId: character.id, message: feedbackMessage },
      ],
    });
  },

  help(socket) {
    let output = '<span class="mediumOrchid">offer &lt;item&gt; to &lt;player&gt; </span><span class="purple">-</span> Offer an item to another player.<br />';
    output += '<span class="mediumOrchid">offer 10gp to &lt;player&gt; </span><span class="purple">-</span> Offer currency to another player.<br />';
    socket.emit('output', { message: output });
  },
};
