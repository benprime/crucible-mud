import Room from '../models/room';
import Area from '../models/area';
import commandCategories from '../core/commandCategories';
import { Direction, getDirection } from '../core/directions';

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
      this.help(socket.character);
      return Promise.resolve();
    }
    const type = match[1].toLowerCase();
    let param = match[2];

    if(type === 'room' || type === 'door') {
      param = getDirection(param);
    }

    return this.execute(socket.character, type, param);
  },

  execute(character, type, param) {
    const room = Room.getById(character.roomId);

    if (type === 'room') {
      const dir = param;
      if (!(dir instanceof Direction)) {
        character.output('Invalid direction!');
        return Promise.reject();
      }
      return room.createRoom(dir).then(() => {
        character.output('Room created.');
        character.toRoom(`${character.name} waves his hand and an exit appears to the ${dir.long}!`, [character.id]);
        return Promise.resolve();
      });
    }

    else if (type === 'door') {
      const dir = param;
      const exit = room.getExit(dir.short);

      if (!exit) {
        character.output('Invalid direction.');
        return Promise.reject();
      }

      if (exit.closed !== undefined) {
        character.output('Door already exists.');
        return Promise.reject();
      }

      exit.closed = true;
      room.save(err => { if (err) throw err; });
      character.output('Door created.');
      character.toRoom(`${character.name} waves his hand and a door appears to the ${dir.long}!`, [character.id]);
      return Promise.resolve();
    }

    else if (type === 'area') {
      let area = Area.getByName(param);
      if (area) {
        character.output(`Area already exists: ${area.id}`);
        return Promise.reject();
      }
      Area.addArea(param);
      return Promise.resolve('Area created.');
    }

    else {
      character.output('Invalid create type.');
      return Promise.reject();
    }
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    output += '<span class="mediumOrchid">create door </span><span class="purple">-</span> Create new room in specified direction.<br />';
    output += '<span class="mediumOrchid">create area </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
