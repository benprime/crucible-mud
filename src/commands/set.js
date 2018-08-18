import Room from '../models/room';
import Area from '../models/area';
import Shop from '../models/shop';
import lookCmd from './look';
import autocomplete from '../core/autocomplete';


function setRoom(socket, prop, value) {
  const room = Room.getById(socket.character.roomId);

  // simple property updates
  const roomPropertyWhiteList = ['name', 'desc', 'alias'];
  if (roomPropertyWhiteList.includes(prop)) {
    if (prop === 'alias') {
      if (value.toUpperCase() === 'NULL') {
        value = null;
        delete Room.roomCache[room.alias];
      }
      if (Room.roomCache[value]) return;
      Room.roomCache[value] = room;
    }
    room[prop] = value;
  }

  else if (prop === 'area') {
    const areas = autocomplete.autocompleteByProperty(Object.values(Area.areaCache), 'name', value);
    if (areas.length > 1) {
      socket.emit('output', { message: `Multiple areas match that param:\n${JSON.stringify(areas)}` });
      return;
    } else if (areas.length === 0) {
      socket.emit('output', { message: 'Unknown area.' });
      return;
    }

    room.area = areas[0].id;
  }

  else if (prop === 'shop') {
    const shop = Shop.getById(socket.character.roomId);
    if (shop) {
      socket.emit('output', { message: 'This room is already a shop.' });
      return;
    }
    Shop.createShop(socket.character.roomId, () => socket.emit('output', { message: 'Shop created.' }));
  }

  else {
    socket.emit('output', { message: 'Invalid property.' });
    return;
  }

  room.save(err => { if (err) throw err; });
  socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} has altered the fabric of reality.` });
  lookCmd.execute(socket);
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

    this.execute(socket, type, prop, value);
  },

  execute(socket, type, prop, value) {

    if (type === 'room') {
      setRoom(socket, prop, value);
    }
    else {
      socket.emit('output', { message: 'Invalid type.' });
      return;
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">set room name &lt;new room name&gt; </span><span class="purple">-</span> Change name of current room.<br />';
    output += '<span class="mediumOrchid">set room desc &lt;new room desc&gt; </span><span class="purple">-</span> Change description of current room.<br />';
    output += '<span class="mediumOrchid">set room alias &lt;new room alias&gt; </span><span class="purple">-</span> Change admin alias of current room. Set alias to "null" to clear it.<br />';
    socket.emit('output', { message: output });
  },
};
