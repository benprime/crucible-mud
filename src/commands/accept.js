import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import { currencyToString } from '../core/currency';

export default {
  name: 'accept',

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
    this.execute(socket, match[1], match[2]);
  },

  execute(socket, userName) {
    // autocomplete username
    const acResult = autocomplete.autocompleteTypes(socket, ['player'], userName);
    if (!acResult) return;
    const fromUser = acResult.item;

    // from user socket
    let fromUserSocket = socketUtil.validUserInRoom(socket, fromUser.username);
    if (!fromUserSocket) {
      socket.emit('output', { message: `${userName} is not here!` });
      return;
    }

    const offer = socket.character.offers.find(o => o.fromUserName === fromUser.username);
    if (!offer) {
      socket.emit('output', { message: `There are no offers from ${fromUser.username}.` });
      return;
    }

    if (offer.currency) {
      // check if offering user's funds have changed since the offer was made
      if (fromUserSocket.character.currency < offer.currency) {
        socket.emit('output', { message: `${fromUser.username} no longer has enough money to complete this offer.` });
        socket.character.offers = socket.character.offers.filter(o => o.fromUserName !== fromUser.username);
        return;
      }
      fromUserSocket.character.currency -= offer.currency;
      socket.character.currency += offer.currency;
    } else {
      // check that offering user still has item when it is accepted
      const item = fromUserSocket.character.inventory.id(offer.item.id);
      if (!item) {
        socket.emit('output', { message: `${fromUser.username} no longer has the offered item in their inventory.` });
        socket.character.offers = socket.character.offers.filter(o => o.fromUserName !== fromUser.username);
        return;
      }
      fromUserSocket.character.inventory.id(offer.item.id).remove();
      socket.character.inventory.push(item);
    }
    socket.character.offers = socket.character.offers.filter(o => o.fromUserName !== fromUser.username);
    fromUserSocket.character.save(err => { if (err) throw err; });
    socket.character.save(err => { if (err) throw err; });

    // format and emit feedback messages
    let fromUserMessage;
    let toUserMessage;
    if (offer.currency) {
      fromUserMessage = `${socket.user.username} accepts your offer of ${currencyToString(offer.currency)}.`;
      toUserMessage = `You accept the offer of ${currencyToString(offer.currency)} from ${fromUserSocket.user.username}.`;
    } else {
      fromUserMessage = `${socket.user.username} accepts the ${offer.item.displayName}.`;
      toUserMessage = `You accept the ${offer.item.displayName} from ${fromUserSocket.user.username}.`;
    }

    fromUserSocket.emit('output', { message: fromUserMessage });
    socket.emit('output', { message: toUserMessage });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">accept offer &lt;player&gt; </span><span class="purple">-</span> Accept an offer from another player.<br />';
    socket.emit('output', { message: output });
  },
};
