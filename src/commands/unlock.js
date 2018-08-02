import config from '../config';
import autocomplete from '../core/autocomplete';
import Room from '../models/room';

export default {
  name: 'unlock',

  patterns: [
    /^unlock\s+(\w+)\s+with\s+(.+)$/i,
    /^unlock\s+/i,
    /^unlock$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      help(socket);
      return;
    }
    const dir = match[1].toLowerCase();
    const keyName = match[2];
    this.execute(socket, dir, keyName);
  },

  execute(socket, dir, keyName, cb) {
    const room = Room.getById(socket.user.roomId);
    dir = Room.validDirectionInput(dir);
    let exit = room.getExit(dir);
    if (!exit) {
      socket.emit('output', { message: 'No door in that direction.' });
      return;
    }

    if (!exit.locked) {
      socket.emit('output', { message: 'That door is not locked.' });
      return;
    }

    const key = autocomplete.autocompleteTypes(socket, ['key'], keyName);
    if(!key) {
      socket.emit('output', { message: 'You don\'t seem to be carrying that key.' });
      return;
    }

    if (key.name != exit.keyName) {
      socket.emit('output', { message: 'That key does not unlock that door.' });
      return;
    }

    setTimeout(() => {
      exit.locked = true;
      let doorDesc;
      if (exit.dir === 'u') {
        doorDesc = 'above';
      } else if (exit.dir === 'd') {
        doorDesc = 'below';
      } else {
        doorDesc = `to the ${Room.shortToLong(exit.dir)}`;
      }

      if (exit.closed === true) {
        global.io.to(room.id).emit('output', { message: `The door ${doorDesc} clicks locked!` });
      } else {
        exit.closed = true;
        global.io.to(room.id).emit('output', { message: `The door ${doorDesc} slams shut and clicks locked!` });
      }
      if(cb) cb(exit);
    }, config.DOOR_CLOSE_TIMER);

    exit.locked = false;
    socket.emit('output', { message: 'Door unlocked.' });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">unlock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Unlock a door with the key type you are carrying.<br />';
    socket.emit('output', { message: output });
  },

};
