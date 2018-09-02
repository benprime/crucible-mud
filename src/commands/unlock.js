import config from '../config';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
import Room from '../models/room';
import commandCategories from '../core/commandCategories';

export default {
  name: 'unlock',
  desc: 'unlock a door with a key',
  category: commandCategories.door,

  patterns: [
    /^unlock\s+(\w+)\s+with\s+(.+)$/i,
    /^unlock\s+/i,
    /^unlock$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      this.help(socket.character);
      return Promise.resolve();
    }
    const dir = match[1].toLowerCase();
    const keyName = match[2];
    return this.execute(socket.character, dir, keyName);
  },

  execute(character, dir, keyName, cb) {
    const room = Room.getById(character.roomId);
    let exit = room.getExit(dir.short);
    if (!exit) {
      character.output('No door in that direction.');
      return Promise.reject();
    }

    if (!exit.locked) {
      character.output('That door is not locked.');
      return Promise.reject();
    }

    const acResult = autocomplete.multiple(character, ['key'], keyName);
    if (!acResult) {
      character.output('You don\'t seem to be carrying that key.');
      return Promise.reject();
    }

    const key = acResult.item;

    if (key.name != exit.keyName) {
      character.output('That key does not unlock that door.');
      return Promise.reject();
    }

    setTimeout(() => {
      exit.locked = true;
      let doorDesc;
      if (exit.dir === 'u') {
        doorDesc = 'above';
      } else if (exit.dir === 'd') {
        doorDesc = 'below';
      } else {
        doorDesc = `to the ${dir.long}`;
      }

      // todo: move this socket interaction to the room model
      if (exit.closed === true) {
        socketUtil.roomMessage(room.id, `The door ${doorDesc} clicks locked!`);
      } else {
        exit.closed = true;
        socketUtil.roomMessage(room.id, `The door ${doorDesc} slams shut and clicks locked!`);
      }
      if (cb) cb(exit);
    }, config.DOOR_CLOSE_TIMER);

    exit.locked = false;

    character.output('Door unlocked.');

    // todo: "To the down?"
    character.toRoom(`${character.name} unlocks the door to the ${dir.long}.`);

    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">unlock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Unlock a door with the key type you are carrying.<br />';
    character.output(output);
  },

};
