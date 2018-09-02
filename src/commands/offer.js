import autocomplete from '../core/autocomplete';
import { currencyToInt, currencyToString } from '../core/currency';
import config from '../config';
import commandCategories from '../core/commandCategories';

export default {
  name: 'offer',
  desc: 'offer an item to another player',
  category: commandCategories.item,
  
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
      this.help(socket.character);
      return Promise.resolve();
    }
    return this.execute(socket.character, match[1], match[2]);
  },

  execute(character, itemName, userName, cb) {
    let item = null;

    // autocomplete username
    const toCharacter = autocomplete.character(character, userName);
    if (!toCharacter) {
      character.output('Unknown user or user not connected.');
      return Promise.reject();
    }

    if (toCharacter.roomId !== character.roomId) {
      character.output(`${userName} is not here!`);
      return Promise.reject();
    }

    // check if the offer is currency
    const currencyValue = currencyToInt(itemName);
    if (currencyValue) {
      if (character.currency < currencyValue) {
        toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName !== character.name);
        character.output('You do not have enough money.');
        return Promise.reject();
      }
    } else {
      const acResult = autocomplete.multiple(character, ['inventory'], itemName);
      if (!acResult) {
        character.output('You don\'t seem to be carrying that.');
        return Promise.reject();
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
      if(cb) cb(); // this callback currently only exists for testing
    }, config.OFFER_TIMEOUT);

    // format and send feedback messages
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

    toCharacter.output(offerMessage);
    character.output(feedbackMessage);
    return Promise.resolve();
  },

  help(character) {
    let output = '<span class="mediumOrchid">offer &lt;item&gt; to &lt;player&gt; </span><span class="purple">-</span> Offer an item to another player.<br />';
    output += '<span class="mediumOrchid">offer 10gp to &lt;player&gt; </span><span class="purple">-</span> Offer currency to another player.<br />';
    character.output(output);
  },
};
