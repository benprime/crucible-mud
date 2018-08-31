import Room from '../models/room';
import Area from '../models/area';
import socketUtil from '../core/socketUtil';
import { commandCategories } from '../core/commandManager';

export default {
  name: 'create',
  desc: 'create a room or door',
  category: commandCategories.world,
  admin: true,

  patterns: [
    /^create\s+(room)\s+(\w+)$/i,
    /^create\s+(door)\s+(\w+)$/i,
    /^create\s+(area)\s+(.+)$/i,
    /^create\s+.*$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 3) {
      this.help(socket);
      return;
    }
    const type = match[1].toLowerCase();
    const param = match[2];
    this.execute(socket.character, type, param)
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, type, param) {
    const room = Room.getById(character.roomId);

    if (type === 'room') {
      const dir = Room.validDirectionInput(param.toLowerCase());
      if (!dir) {
        return Promise.reject('Invalid direction!');
      }
      return room.createRoom(dir).then(() => {
        return Promise.resolve({
          charMessages: [
            { charId: character.id, message: 'Room created.' },
          ],
          roomMessages: [
            { roomId: character.roomId, message: `${character.name} waves his hand and an exit appears to the ${Room.shortToLong(dir)}!`, exclude: [character.id] },
          ],
        });
      });
    }

    else if (type === 'door') {
      const dir = Room.validDirectionInput(param);
      const exit = room.getExit(dir);

      if (!exit) {
        return Promise.reject('Invalid direction.');
      }

      if (exit.closed !== undefined) {
        return Promise.reject('Door already exists.');
      }

      exit.closed = true;
      room.save(err => { if (err) throw err; });
      return Promise.resolve({
        charMessages: [
          { charId: character.id, message: 'Door created.' },
        ],
        roomMessages: [
          { roomId: character.roomId, message: `${character.name} waves his hand and a door appears to the ${Room.shortToLong(dir)}!`, exclude: [character.id] },
        ],
      });
    }

    else if (type === 'area') {
      let area = Area.getByName(param);
      if (area) {
        return Promise.reject(`Area already exists: ${area.id}`);
      }
      Area.addArea(param);
      return Promise.resolve('Area created.');
    }

    else {
      return Promise.reject('Invalid create type.');
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    output += '<span class="mediumOrchid">create door </span><span class="purple">-</span> Create new room in specified direction.<br />';
    output += '<span class="mediumOrchid">create area </span><span class="purple">-</span> Create new room in specified direction.<br />';
    socket.emit('output', { message: output });
  },

};
