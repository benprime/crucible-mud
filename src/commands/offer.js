import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import { currencyToInt, currencyToString } from '../core/currency';

export default {
  name: 'offer',

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
    this.execute(socket, match[1], match[2]);
  },

  execute(socket, itemName, userName) {
    let item = null;


    // autocomplete username
    const acResult = autocomplete.autocompleteTypes(socket, ['player'], userName);
    if (!acResult) {
      socket.emit('output', { message: 'Unknown user or user not connected.' });
      return;
    }
    const toUser = acResult.item;

    // validate target user and get target user socket
    let toCharacter = socketUtil.characterInRoom(socket.character.roomId, toUser.username);
    if (!toCharacter) {
      socket.emit('output', { message: `${userName} is not here!` });
      return;
    }

    // check if the offer is currency
    const currencyValue = currencyToInt(itemName);
    if (currencyValue) {
      if (socket.character.currency < currencyValue) {
        toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName !== socket.user.username);
        socket.emit('output', { message: 'You do not have enough money.' });
        return;
        //return Promise.reject(new errors.InsufficientFundsError(`${fromCharacter.username} no longer has enough money to complete this offer.`));
      }

    } else {
      const acResult = autocomplete.autocompleteTypes(socket, ['inventory'], itemName);
      if (!acResult) {
        return;
      }
      item = acResult.item;

    }



    // build offer
    const offer = {
      fromUserName: socket.user.username,
      toUserName: userName,
      item: item,
      currency: currencyValue,
    };

    // a player can only offer one item or amount to another player
    toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName != socket.user.username);
    toCharacter.offers.push(offer);

    // set an expiration of 60 seconds for this offer
    setTimeout(() => {
      toCharacter.offers = toCharacter.offers.filter(o => o.fromUserName != socket.user.username);
    }, 60000);

    // format and emit feedback messages
    let offerMessage;
    let feedbackMessage;
    if (currencyValue) {
      offerMessage = `${socket.user.username} offers you ${currencyToString(currencyValue)}`;
      feedbackMessage = `You offer ${currencyToString(currencyValue)} to ${userName}.`;
    } else {
      offerMessage = `${socket.user.username} offers you a ${itemName}.`;
      feedbackMessage = `You offer your ${itemName} to ${userName}.`;
    }
    offerMessage += `\nTo accept the offer: accept offer ${socket.user.username}`;

    let toSocket = socketUtil.getSocketByCharacterId(toCharacter.id);
    toSocket.emit('output', { message: offerMessage });
    socket.emit('output', { message: feedbackMessage });
  },

  help(socket) {
    let output = '<span class="mediumOrchid">offer &lt;item&gt; to &lt;player&gt; </span><span class="purple">-</span> Offer an item to another player.<br />';
    output += '<span class="mediumOrchid">offer 10gp to &lt;player&gt; </span><span class="purple">-</span> Offer currency to another player.<br />';
    socket.emit('output', { message: output });
  },
};
