import Room from '../models/room';
import Area from '../models/area';
import Shop from '../models/shop';
import lookCmd from './look';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
import { updateHUD } from '../core/hud';
import commandCategories from '../core/commandCategories';

function setCurrency(character, amount) {
  character.currency = amount;
  const socket = socketUtil.getSocketByCharacterId(character.id);
  updateHUD(socket);
  return character.save();
}

function setHp(character, amount) {
  character.currentHP = amount;
  const socket = socketUtil.getSocketByCharacterId(character.id);
  updateHUD(socket);
  return character.save();
}

function setBleeding(character, amount) {
  character.bleeding = amount;
  return character.save();
}

function setDebug(character, value) {
  character.user.debug = value.toLowerCase() === 'on';
  return character.user.save();
}

function setRoom(character, prop, value) {
  const room = Room.getById(character.roomId);

  // simple property updates
  const roomPropertyWhiteList = ['name', 'desc', 'alias'];


  if (prop === 'area') {
    const areas = autocomplete.byProperty(Object.values(Area.areaCache), 'name', value);
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
    character.output(`${character.name} has altered the fabric of reality.`);
    character.toRoom(`${character.name} has altered the fabric of reality.`, [character.id]);
    return Promise.resolve();
  }

  else {
    return Promise.reject('Invalid property.');
  }
}


export default {
  name: 'set',
  desc: 'set game object properties',
  category: commandCategories.world,
  admin: true,

  patterns: [
    /^set\s+(room)\s+(desc)\s+(.+)$/i,
    /^set\s+(room)\s+(name)\s+(.+)$/i,
    /^set\s+(room)\s+(alias)\s+(.+)$/i,
    /^set\s+(room)\s+(area)\s+(.+)$/i,
    /^set\s+(room)\s+(shop)$/i,
    /^set\s+(currency)\s+(\d+)$/i,
    /^set\s+(hp)\s+(\d+)$/i,
    /^set\s+(bleeding)\s+(\d+)$/i,
    /^set\s+(debug)\s+(on|off)$/i,

    /^set.*$/i,
  ],

  dispatch(socket, match) {

    if (match.length < 3) {
      return this.help(socket.character);
    }

    const type = match[1];
    const prop = match[2];
    const value = match[3];

    return this.execute(socket.character, type, prop, value)
      .then(() => lookCmd.execute(socket))
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character, type, prop, value) {

    if (type === 'room') {
      return setRoom(character, prop, value);
    } else if (type === 'currency') {
      return setCurrency(character, prop); // prop is 'value' in this case
    } else if (type === 'bleeding') {
      return setBleeding(character, prop); // prop is 'value' in this case
    } else if (type === 'hp') {
      return setHp(character, prop); // prop is 'value' in this case
    } else if (type === 'debug') {
      return setDebug(character, prop); // prop is 'value' in this case
    }
    else {
      return Promise.reject('Invalid type.');
    }
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">set room name &lt;new room name&gt; </span><span class="purple">-</span> Change name of current room.<br />';
    output += '<span class="mediumOrchid">set room desc &lt;new room desc&gt; </span><span class="purple">-</span> Change description of current room.<br />';
    output += '<span class="mediumOrchid">set room alias &lt;new room alias&gt; </span><span class="purple">-</span> Change admin alias of current room. Set alias to "null" to clear it.<br />';
    output += '<span class="mediumOrchid">set room shop </span><span class="purple">-</span> Generate a shop for the current room.<br />';
    output += '<span class="mediumOrchid">set currency &lt;amount&gt; </span><span class="purple">-</span> Add money to your character.<br />';
    output += '<span class="mediumOrchid">set hp &lt;amount&gt; </span><span class="purple">-</span> Set the hp amount for your character.<br />';
    output += '<span class="mediumOrchid">set blleding &lt;value&gt; </span><span class="purple">-</span> Set the bleeding value for your character.<br />';
    output += '<span class="mediumOrchid">set debug &lt;on|off&gt; </span><span class="purple">-</span> Enable debug view.<br />';
    character.output(output);
  },
};
