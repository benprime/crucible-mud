import Room from '../models/room';
import autocomplete from '../core/autocomplete';

export default {
  name: 'lock',
  admin: true,

  patterns: [
    /^lock\s+(\w+)\s+with\s+(.+)$/i,
    /^lock\s+/i,
    /^lock$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      this.help(socket);
      return;
    }
    const dir = match[1].toLowerCase();
    const keyName = match[2];
    this.execute(socket, dir, keyName);
  },

  execute(socket, dir, keyName) {
    const room = Room.getById(socket.character.roomId);
    dir = Room.validDirectionInput(dir);
    let exit = room.getExit(dir);
    if (!exit || !('closed' in exit)) {
      socket.emit('output', { message: 'No door in that direction.' });
      return;
    }

    const acResult = autocomplete.autocompleteTypes(socket, ['key'], keyName);
    if (!acResult) {
      socket.emit('output', { message: 'Unknown key.' });
      return;
    }

    let key = acResult.item;

    exit.closed = true;
    exit.keyName = key.name;
    exit.locked = true;
    room.save(err => { if (err) throw err; });
    socket.emit('output', { message: 'Door locked.' });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">lock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Lock a door with the key type you are carrying.<br />';
    socket.emit('output', { message: output });
  },

};
