import Room from '../models/room';
import Area from '../models/area';
import Shop from '../models/shop';
import lookCmd from './look';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';

function setCurrency(character, amount) {
  character.currency = amount;
  return character.save(err => {
    if (err) throw err;
  });
}

function setDebug(character, value) {
  const socket = socketUtil.getSocketByCharacterId(character.id);
  socket.user.debug = value.toLowerCase() === 'on';
  return socket.user.save(err => {
    if (err) throw err;
  });
}

function setRoom(character, prop, value) {
  const room = Room.getById(character.roomId);

  // simple property updates
  const roomPropertyWhiteList = ['name', 'desc', 'alias'];


  if (prop === 'area') {
    const areas = autocomplete.autocompleteByProperty(Object.values(Area.areaCache), 'name', value);
    if (areas.length > 1) {
      return Promise.reject(`Multiple areas match that param:\n${JSON.stringify(areas)}`);
    } else if (areas.length === 0) {
      return Promise.reject('Unknown area.');
    }

    room.areaId = areas[0].id;
    return Promise.resolve('Area created');
  }

  else if (prop === 'shop') {
    const shop = Shop.getById(character.roomId);
    if (shop) {
      return Promise.reject('This room is already a shop.');
    }
    return Promise.resolve(Shop.createShop(character.roomId).then(() => 'Shop created.'));
  }

  else if (roomPropertyWhiteList.includes(prop)) {
    if (prop === 'alias') {
      if (value.toUpperCase() === 'NULL') {
        value = null;
        delete Room.roomCache[room.alias];
      }
      if (Room.roomCache[value]) return;
      Room.roomCache[value] = room;
    }
    room[prop] = value;

    room.save(err => { if (err) throw err; });
    // todo: add a type of message that is for the room, not just a broadcast
    return Promise.resolve({
      charMessages: [
        { charId: character.id, message: `${character.name} has altered the fabric of reality.` },
      ],
      roomMessages: [
        { roomId: character.roomId, message: `${character.name} has altered the fabric of reality.`, exclude: [character.id] },
      ],
    });
  }

  else {
    return Promise.reject('Invalid property.');
  }
}


export default {
  name: 'set',
  admin: true,

  patterns: [
    /^set\s+(room)\s+(desc)\s+(.+)$/i,
    /^set\s+(room)\s+(name)\s+(.+)$/i,
    /^set\s+(room)\s+(alias)\s+(.+)$/i,
    /^set\s+(room)\s+(area)\s+(.+)$/i,
    /^set\s+(room)\s+(shop)$/i,
    /^set\s+(currency)\s+(\d+)$/i,
    /^set\s+(debug)\s+(on|off)$/i,

    /^set.*$/i,
  ],

  dispatch(socket, match) {

    if (match.length < 3) {
      this.help(socket);
      return;
    }

    const type = match[1];
    const prop = match[2];
    const value = match[3];

    this.execute(socket.character, type, prop, value).then(() => lookCmd.execute(socket));
  },

  execute(character, type, prop, value) {

    if (type === 'room') {
      return setRoom(character, prop, value);
    } else if (type === 'currency') {
      return setCurrency(character, prop); // prop is 'value' in this case
    } else if (type === 'debug') {
      return setDebug(character, prop); // prop is 'value' in this case
    }
    else {
      return Promise.reject('Invalid type.');
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">set room name &lt;new room name&gt; </span><span class="purple">-</span> Change name of current room.<br />';
    output += '<span class="mediumOrchid">set room desc &lt;new room desc&gt; </span><span class="purple">-</span> Change description of current room.<br />';
    output += '<span class="mediumOrchid">set room alias &lt;new room alias&gt; </span><span class="purple">-</span> Change admin alias of current room. Set alias to "null" to clear it.<br />';
    output += '<span class="mediumOrchid">set room shop &lt;new room alias&gt; </span><span class="purple">-</span> Generate a shop for the current room.<br />';
    output += '<span class="mediumOrchid">set room currency &lt;amount&gt; </span><span class="purple">-</span> Add money to your character.<br />';
    output += '<span class="mediumOrchid">set debug &lt;on|off&gt; </span><span class="purple">-</span> Enable debug view.<br />';
    socket.emit('output', { message: output });
  },
};
