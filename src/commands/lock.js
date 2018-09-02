import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'lock',
  desc: 'lock a door',
  category: commandCategories.door,
  admin: true,

  patterns: [
    /^lock\s+(\w+)\s+with\s+(.+)$/i,
    /^lock\s+/i,
    /^lock$/i,
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

  execute(character, dir, keyName) {
    const room = Room.getById(character.roomId);
    let exit = room.getExit(dir.short);
    if (!exit || !('closed' in exit)) {
      character.output('No door in that direction.');
      return Promise.reject();
    }

    const acResult = autocomplete.multiple(character, ['key'], keyName);
    if (!acResult) {
      character.output('Unknown key.');
      return Promise.reject();
    }

    let key = acResult.item;

    exit.closed = true;
    exit.keyName = key.name;
    exit.locked = true;
    room.save(err => { if (err) throw err; });
    character.output('Door locked.');
    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">lock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Lock a door with the key type you are carrying.<br />';
    character.output(output);
  },

};
