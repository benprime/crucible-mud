import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import { currencyToInt, currencyToString } from '../core/currency';

export default {
  name: 'offer',

  patterns: [
    /^offer\s+(.+)\s+to\s+(.+)$/i,
    /^offer\s.*$/i,
    /^offer$/i,
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

    // check if the offer is currency
    const copperValue = currencyToInt(itemName);
    if (!copperValue) {
      const acResult = autocomplete.autocompleteTypes(socket, ['inventory'], itemName);
      if (!acResult) {
        return;
      }
      item = acResult.item;
    }

    // autocomplete username
    const acResult = autocomplete.autocompleteTypes(socket, ['player'], userName);
    if (!acResult) return;
    const toUser = acResult.item;

    // validate target user and get target user socket
    let toUserSocket = socketUtil.validUserInRoom(socket, toUser.username);
    if (!toUserSocket) {
      socket.emit('output', { message: `${userName} is not here!` });
      return;
    }

    // build offer
    const offer = {
      fromUserName: socket.user.username,
      toUserName: userName,
      item: item,
      currency: copperValue,
    };

    // a player can only offer one item or amount to another player
    toUserSocket.character.offers = toUserSocket.character.offers.filter(o => o.fromUserName != socket.user.username);
    toUserSocket.character.offers.push(offer);

    // set an expiration of 60 seconds for this offer
    setTimeout(() => {
      toUserSocket.character.offers = toUserSocket.character.offers.filter(o => o.fromUserName != socket.user.username);
    }, 60000);

    // format and emit feedback messages
    let offerMessage;
    let feedbackMessage;
    if (copperValue) {
      offerMessage = `${socket.user.username} offers you ${currencyToString(copperValue)}`;
      feedbackMessage = `You offer ${currencyToString(copperValue)} to ${userName}.`;
    } else {
      offerMessage = `${socket.user.username} offers you a ${itemName}.`;
      feedbackMessage = `You offer your ${itemName} to ${userName}.`;
    }
    offerMessage += `\nTo accept the offer: accept offer ${socket.user.username}`;

    toUserSocket.emit('output', { message: offerMessage });
    socket.emit('output', { message: feedbackMessage });
  },

  help(socket) {
    let output = '<span class="mediumOrchid">offer &lt;item&gt; to &lt;player&gt; </span><span class="purple">-</span> Offer an item to another player.<br />';
    output += '<span class="mediumOrchid">offer 10gp to &lt;player&gt; </span><span class="purple">-</span> Offer currency to another player.<br />';
    socket.emit('output', { message: output });
  },
};
