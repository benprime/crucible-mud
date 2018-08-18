import Room from '../models/room';
import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import utils from '../core/utilities';

export default {
  name: 'take',

  patterns: [
    /^take\s+(.+)$/i,
    /^get\s+(.+)$/i,
    /^take/i,
    /^get/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      socket.emit('output', { message: 'What do you want to take?' });
    }
    this.execute(socket, match[1]);
  },

  execute(socket, itemName) {
    function saveItem(item) {
      // and give it to the user
      if (item.type === 'key') {
        socket.character.keys.push(item);
      } else {
        socket.character.inventory.push(item);
      }
      socket.character.save(err => { if (err) throw err; });
      socket.emit('output', { message: `${item.displayName} was added to your inventory.` });
    }

    // get any items offered to the user
    let offers;
    if (Array.isArray(socket.offers) && socket.offers.length > 0) {
      offers = socket.offers.filter(({ toUserName }) => toUserName.toLowerCase() === socket.user.username.toLowerCase());
    }

    // handle an item offered from another user
    if (Array.isArray(offers) && offers.length > 0) {
      let offerIndex = socket.offers.findIndex(({ item }) => item.name === itemName);
      if (offerIndex !== -1) {
        let offer = socket.offers[offerIndex];
        let offeringUserSocket = socketUtil.getSocketByUsername(offer.fromUserName);
        if (!offeringUserSocket) {
          socket.emit('output', { message: 'Invalid username or user is offline.' });
          return;
        }

        saveItem(offer.item);

        // remove the offer from the list of offers
        socket.offers.splice(offerIndex, 1);

        // remove the item from the other users' inventory
        const otherUserItemIndex = offeringUserSocket.character.inventory.findIndex(({ id }) => id === offer.item.id);
        if (otherUserItemIndex === -1) {
          throw 'User took offered item, but was unable to remove item from source inventory.';
        }
        offeringUserSocket.character.inventory.splice(otherUserItemIndex, 1);
        offeringUserSocket.emit('output', { message: `${offer.item.displayName} was removed from your inventory.` });
        offeringUserSocket.character.save(err => { if (err) throw err; });

        return;
      }
    }

    const acResult = autocomplete.autocompleteTypes(socket, ['room'], itemName);
    if (acResult) {
      const roomItem = acResult.item;

      // fixed items cannot be taken, such as a sign.
      if (roomItem.fixed) {
        socket.emit('output', { message: 'You cannot take that!' });
        return;
      }
      if (roomItem.hidden && !socket.user.admin) {
        //ignore players from unknowingly grabbing a hidden item
        socket.emit('output', { message: 'You don\'t see that here!' });
        return;
      }
      // take the item from the room
      const room = Room.getById(socket.character.roomId);
      utils.removeItem(room.inventory, roomItem);

      saveItem(roomItem);
      room.save(err => { if (err) throw err; });

      socket.emit('output', { message: `${roomItem.displayName} taken.` });
      socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} takes ${roomItem.displayName}.` });
      return;
    }

    socket.emit('output', { message: 'You don\'t see that here!' });
    return;
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />';
    socket.emit('output', { message: output });
  },
};
