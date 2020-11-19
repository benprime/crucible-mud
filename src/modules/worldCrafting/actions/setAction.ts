import Room from '../../../models/room';
import Area from '../../../models/area';
import Shop from '../../../models/shop';
import autocomplete from '../../../core/autocomplete';
import socketUtil from '../../../core/socketUtil';
import { updateHUD } from '../../../core/hud';
import characterStates from '../../../core/characterStates';

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
      character.output(`Multiple areas match that param:\n${JSON.stringify(areas)}`);
      return false;
    } else if (areas.length === 0) {
      character.output('Unknown area.');
      return false;
    }

    room.areaId = areas[0].id;
    character.output('Area created.');
    return true;
  }

  else if (prop === 'shop') {
    const shop = Shop.getById(character.roomId);
    if (shop) {
      character.output('This room is already a shop.');
      return false;
    }

    return Promise.resolve(Shop.createShop(character.roomId)
      .then(() => character.output('Shop created.')));
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

    room.save(err => {
      if (err) throw err;
    });
    room.output(`${character.name} has altered the fabric of reality.`);
    return true;
  }

  else {
    character.output('Invalid property.');
    return false;
  }
}


export default {
  name: 'set',
  execute(character, type, prop, value) {

    if (type === 'room') {
      return setRoom(character, prop, value);
    } else if (type === 'currency') {
      return setCurrency(character, prop); // prop is 'value' in this case
    } else if (type === 'bleeding') {
      character.setState(characterStates.BLEEDING);
      return;
    } else if (type === 'hp') {
      return setHp(character, prop); // prop is 'value' in this case
    } else if (type === 'debug') {
      return setDebug(character, prop); // prop is 'value' in this case
    }
    else {
      character.output('Invalid type.');
      return false;
    }
  },
};
