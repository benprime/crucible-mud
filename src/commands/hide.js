import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';

function hideDir(socket, room, dir) {
  let exit = room.getExit(dir);
  if (!exit) {
    return Promise.reject('No exit in that direction.<br />');
  }

  exit.hidden = true;
  room.save(err => { if (err) throw err; });
  return Promise.resolve('The exit has been concealed.<br />');
}

// for items
function hideItem(character, room, itemName) {

  const acResult = autocomplete.multiple(character, ['inventory', 'room'], itemName);
  if (!acResult) {
    return Promise.reject('Item does not exist in inventory or in room.<br />');
  }

  const hideTargetObj = acResult.item;

  if (!hideTargetObj) {
    return Promise.reject('Item does not exist in inventory or in room.<br />');
  }

  hideTargetObj.hidden = true;
  room.save(err => { if (err) throw err; });

  return Promise.resolve(`${itemName} has been concealed.<br />`);
}


export default {
  name: 'hide',
  desc: 'hide an item in your current room',

  patterns: [
    /^hide$/i,
    /^hide\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    let hideTarget = null;
    if (match.length > 1) {
      hideTarget = match[1];
    }
    else {
      this.help(socket);
      return;
    }
    this.execute(socket.character, hideTarget)
      .then(output => socketUtil.output(socket, output))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, hideTarget) {
    const room = Room.getById(character.roomId);

    if (hideTarget) {
      hideTarget = hideTarget.toLowerCase();

      if (Room.validDirectionInput(hideTarget)) {
        return hideDir(character, room, hideTarget);
      } else {
        return hideItem(character, room, hideTarget);
      }
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">hide &lt;item name/exit dir&gt; </span><span class="purple">-</span> Make target &lt;item name/exit dir&gt; hidden.<br />';
    socket.emit('output', { message: output });
  },

};
