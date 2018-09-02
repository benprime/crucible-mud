import Room from '../models/room';
import mobData from '../data/mobData';
import Mob from '../models/mob';
import itemData from '../data/itemData';
import Item from '../models/item';
import commandCategories from '../core/commandCategories';

export const spawn = (itemType) => {
  return new Item({
    name: itemType.name,
    desc: itemType.desc,
    type: itemType.type,
    fixed: itemType.fixed,
    equipSlots: itemType.equipSlots,
    damage: itemType.damage,
    weaponType: itemType.weaponType,
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
  desc: 'create mob and item instances of the catalog types',
  category: commandCategories.admin,
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
      this.help(socket.character);
      return Promise.reject();
    }
    let typeName = match[1];
    let itemTypeName = match[2];
    return this.execute(socket.character, typeName, itemTypeName);
  },

  execute(character, type, name) {

    // Mob
    //---------------------
    if (type === 'mob') {
      const createType = mobData.catalog.find(mob => mob.name.toLowerCase() === name.toLowerCase());

      if (!createType) {
        character.output('Unknown mob type.');
        return Promise.reject();
      }

      const room = Room.getById(character.roomId);
      if (!room) {
        character.output(`no room found for current user room: ${character.roomId}`);
        return Promise.reject();
      }

      // clone the create type and give it an id
      let mob = new Mob(createType, room.id);

      room.mobs.push(mob);

      character.output('Summoning successful.');
      character.toRoom(`${character.name} waves his hand and a ${mob.displayName} appears!`, [character.id]);
      return Promise.resolve();

      // Item
      //---------------------
    } else if (type === 'item') {

      const itemType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');
      if (!itemType) {
        character.output(`Attempted to spawn unknown item type: ${name}`);
        return Promise.reject();
      }

      spawnAndGive(character, itemType);

      character.output('Item created.');
      character.toRoom(`${character.name} emits a wave of energy!`, [character.id]);
      return Promise.resolve();

      // Key
      //---------------------
    } else if (type === 'key') {
      const keyType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'key');

      if (!keyType) {
        character.output('Unknown key type.');
        return Promise.reject();
      }

      let key = new Item({
        name: keyType.name,
        desc: keyType.desc,
        type: 'key',
      });

      character.keys.push(key);
      character.save(err => { if (err) throw err; });
      character.output('Key created.');
      return Promise.resolve();
    }

    // Invalid
    //---------------------
    else {
      character.output('Unknown object type.');
      return Promise.reject();
    }
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">spawn mob &lt;mob name&gt; </span><span class="purple">-</span> Create <mob> in current room.<br />';
    output += '<span class="mediumOrchid">spawn item &lt;item name&gt; </span><span class="purple">-</span> Create <item> in inventory.<br />';
    character.output(output);
  },
};
