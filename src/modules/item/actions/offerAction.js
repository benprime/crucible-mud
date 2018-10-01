import { currencyToString } from '../../../core/currency';
import config from '../../../config';

export default {
  name: 'offer',
  execute(character, item, currency, toCharacter) {

    if (!toCharacter) {
      character.output('Unknown user or user not connected.');
      return false;
    }

    if (toCharacter.roomId !== character.roomId) {
      character.output(`${toCharacter.name} is not here!`);
      return false;
    }

    // check if the offer is currency
    if (currency) {
      if (character.currency < currency) {
        toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName !== character.name);
        character.output('You do not have enough money.');
        return false;
      }
    }

    if (!currency && !item) {
      character.output('You don\'t seem to be carrying that.');
      return false;
    }

    // build offer
    const offer = {
      fromUserName: character.name,
      toUserName: toCharacter.name,
      item: item,
      currency: currency,
    };

    // a player can only offer one item or amount to another player
    toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName != character.name);
    toCharacter.offers.push(offer);

    // set an expiration of 60 seconds for this offer
    setTimeout(() => {
      toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName != character.name);
    }, config.OFFER_TIMEOUT);

    // format and send feedback messages
    let offerMessage;
    let feedbackMessage;
    if (currency) {
      offerMessage = `${character.name} offers you ${currencyToString(currency)}`;
      feedbackMessage = `You offer ${currencyToString(currency)} to ${toCharacter.name}.`;
    } else {
      offerMessage = `${character.name} offers you a ${item.name}.`;
      feedbackMessage = `You offer your ${item.name} to ${toCharacter.name}.`;
    }
    offerMessage += `\nTo accept the offer: accept offer ${character.name}`;

    toCharacter.output(offerMessage);
    character.output(feedbackMessage);
    return true;
  },

};