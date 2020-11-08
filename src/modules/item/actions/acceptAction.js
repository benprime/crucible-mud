import { currencyToString } from '../../../core/currency';

export default {
  name: 'accept',
  execute: (character, fromCharacter) => {
    // autocomplete username
    if (!fromCharacter) {
      character.output('You don\'t seem to have a pending offer from that player!');
      return false;
    }

    if (character.roomId !== fromCharacter.roomId) {
      character.output(`${fromCharacter.name} is not here!`);
      return false;
    }

    const offer = character.offers.find(o => o.fromUserName === fromCharacter.name);
    if (!offer) {
      character.output(`There are no offers from ${fromCharacter.name}.`);
      return false;
    }

    if (offer.currency) {
      // check if offering user's funds have changed since the offer was made
      if (fromCharacter.currency < offer.currency) {
        character.offers = character.offers.filter(o => o.fromUserName !== fromCharacter.name);
        character.output(`${fromCharacter.username} no longer has enough money to complete this offer.`);
        return false;
      }
      fromCharacter.currency -= offer.currency;
      character.currency += offer.currency;
    } else {
      // check that offering user still has item when it is accepted
      const item = fromCharacter.inventory.id(offer.item.id);
      if (!item) {
        character.offers = character.offers.filter(o => o.fromUserName !== fromCharacter.name);
        character.output(`${fromCharacter.name} no longer has the offered item in their inventory.`);
        return false;
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
    return true;
  },
};