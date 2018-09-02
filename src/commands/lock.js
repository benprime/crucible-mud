import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
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
      return this.help(socket.character);
    }
    const dir = match[1].toLowerCase();
    const keyName = match[2];
    return this.execute(socket.character, dir, keyName)
      .then(output => socketUtil.output(socket, output))
      .catch(error => socket.character.output(error));
  },

  execute(character, dir, keyName) {
    const room = Room.getById(character.roomId);
    const validDir = Room.validDirectionInput(dir);
    let exit = room.getExit(validDir);
    if (!exit || !('closed' in exit)) {
      return Promise.reject('No door in that direction.');
    }

    const acResult = autocomplete.multiple(character, ['key'], keyName);
    if (!acResult) {
      return Promise.reject('Unknown key.');
    }

    let key = acResult.item;

    exit.closed = true;
    exit.keyName = key.name;
    exit.locked = true;
    room.save(err => { if (err) throw err; });
    return Promise.resolve('Door locked.');
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">lock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Lock a door with the key type you are carrying.<br />';
    character.output(output);
  },

};
