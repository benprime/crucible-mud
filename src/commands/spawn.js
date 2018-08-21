import Room from '../models/room';
import mobData from '../data/mobData';
import Mob from '../models/mob';
import itemData from '../data/itemData';
import Item from '../models/item';

export const spawn = (itemType) => {
  return new Item({
    name: itemType.name,
    desc: itemType.desc,
    displayName: itemType.displayName,
    type: itemType.type,
    fixed: itemType.fixed,
    equip: itemType.equip,
    damage: itemType.damage,
    damageType: itemType.damageType,
    speed: itemType.speed,
    bonus: itemType.bonus,
  });
};

export const spawnAndGive = (character, itemType, cb) => {

  const item = spawn(itemType);

  character.inventory.push(item);
  character.save((err, character) => {
    if (err) throw err;
    if (cb) cb(character);
  });
  return item;
};

export default {
  name: 'spawn',
  admin: true,

  targets: ['mob', 'player', 'inventoryItem', 'roomItem'],

  patterns: [
    /^spawn\s+(mob)\s+(\w+)$/i,
    /^spawn\s+(item)\s+(\w+)$/i,
    /^spawn\s+(key)\s+(\w+)$/i,
    /^spawn\s+/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      return Promise.reject('Invalid spawn usage.');
    }
    let typeName = match[1];
    let itemTypeName = match[2];
    this.execute(socket.character, typeName, itemTypeName);
  },

  execute(character, type, name) {


    // Mob
    //---------------------
    if (type === 'mob') {
      const createType = mobData.catalog.find(mob => mob.name.toLowerCase() === name.toLowerCase());

      if (!createType) {
        return Promise.reject('Unknown mob type.');
      }

      const room = Room.getById(character.roomId);
      if (!room) {
        return Promise.reject(`no room found for current user room: ${character.roomId}`);
      }

      // clone the create type and give it an id
      let mob = new Mob(createType, room.id);

      room.mobs.push(mob);

      return Promise.resolve({
        charMessages: [
          { charId: character.id, message: 'Summoning successful.' },
        ],
        roomMessages: [
          { roomId: character.roomId, message: `${character.name} waves his hand and a ${createType.displayName} appears!` },
        ],
      });
      
      // Item
      //---------------------
    } else if (type === 'item') {

      const itemType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');
      if (!itemType) {
        return Promise.reject(`Attempted to spawn unknown item type: ${name}`);
      }

      spawnAndGive(character, itemType);

      return Promise.resolve({
        charMessages: [
          { charId: character.id, message: 'Item created.' },
        ],
        roomMessages: [
          { roomId: character.roomId, message: `${character.name} emits a wave of energy!` },
        ],
      });

      // Key
      //---------------------
    } else if (type === 'key') {
      const keyType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'key');

      if (!keyType) {
        return Promise.reject('Unknown key type.');
      }

      let key = new Item({
        name: keyType.name,
        desc: keyType.desc,
        displayName: keyType.displayName,
        type: 'key',
      });

      character.keys.push(key);
      character.save(err => { if (err) throw err; });
      return Promise.resolve('Key created.');
    }

    // Invalid
    //---------------------
    else {
      return Promise.reject('Unknown object type.');
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">spawn mob &lt;mob name&gt; </span><span class="purple">-</span> Create <mob> in current room.<br />';
    output += '<span class="mediumOrchid">spawn item &lt;item name&gt; </span><span class="purple">-</span> Create <item> in inventory.<br />';
    socket.emit('output', { message: output });
  },
};
