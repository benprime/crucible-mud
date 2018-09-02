import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

function hideDir(character, room, dir) {
  let exit = room.getExit(dir);
  if (!exit) {
    character.output('No exit in that direction.<br />');
    return Promise.reject();
  }

  exit.hidden = true;
  room.save(err => { if (err) throw err; });

  character.output('The exit has been concealed.<br />');
  return Promise.resolve();
}

// for items
function hideItem(character, room, itemName) {

  const acResult = autocomplete.multiple(character, ['inventory', 'room'], itemName);
  if (!acResult) {
    character.output('Item does not exist in inventory or in room.<br />');
    return Promise.reject();
  }

  const hideTargetObj = acResult.item;

  if (!hideTargetObj) {
    character.output('Item does not exist in inventory or in room.<br />');
    return Promise.reject();
  }

  hideTargetObj.hidden = true;
  room.save(err => { if (err) throw err; });

  character.output(`${itemName} has been concealed.<br />`);
  return Promise.resolve();
}


export default {
  name: 'hide',
  desc: 'hide an item in your current room',
  category: commandCategories.item,
  
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
      this.help(socket.character);
      return Promise.resolve();
    }
    return this.execute(socket.character, hideTarget);
  },

  execute(character, hideTarget) {
    const room = Room.getById(character.roomId);

    if(!hideTarget) {
      this.help(character);
      return Promise.resolve();
    }

    if (hideTarget) {
      hideTarget = hideTarget.toLowerCase();

      if (Room.validDirectionInput(hideTarget)) {
        return hideDir(character, room, hideTarget);
      } else {
        return hideItem(character, room, hideTarget);
      }
    }
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">hide &lt;item name/exit dir&gt; </span><span class="purple">-</span> Make target &lt;item name/exit dir&gt; hidden.<br />';
    character.output(output);
  },

};
