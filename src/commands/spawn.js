import Room from '../models/room';
import mobData from '../data/mobData';
import Mob from '../models/mob';
import itemData from '../data/itemData';
import Item from '../models/item';

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
      socket.emit('output', { message: 'Invalid spawn usage.' });
      return;
    }
    let typeName = match[1];
    let itemTypeName = match[2];
    this.execute(socket, typeName, itemTypeName);
  },

  execute(socket, type, name) {


    // Mob
    //---------------------
    if (type === 'mob') {
      const createType = mobData.catalog.find(mob => mob.name.toLowerCase() === name.toLowerCase());

      if (!createType) {
        socket.emit('output', { message: 'Unknown mob type.' });
        return;
      }

      const room = Room.getById(socket.user.roomId);
      if (!room) {
        throw `no room found for current user room: ${socket.user.roomId}`;
      }

      // clone the create type and give it an id
      let mob = new Mob(createType, room.id);

      room.mobs.push(mob);
      socket.emit('output', { message: 'Summoning successful.' });
      socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} waves his hand and a ${createType.displayName} appears!` });


      // Item
      //---------------------
    } else if (type === 'item') {
      const createType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');

      if (!createType) {
        socket.emit('output', { message: 'Unknown item type.' });
        return;
      }

      // Object.assign didn't seem to work properly when
      // working with mongoose instance...
      let item = new Item({
        name: createType.name,
        desc: createType.desc,
        displayName: createType.displayName,
        type: createType.type,
        fixed: createType.fixed,
        equip: createType.equip,
        damage: createType.damage,
        damageType: createType.damageType,
        speed: createType.speed,
        bonus: createType.bonus,
      });


      socket.user.inventory.push(item);
      socket.user.save();
      socket.emit('output', { message: 'Item created.' });

      // todo: determine if we want to hide when an admin creates an item
      //socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} waves his hand and a ${createType.displayName} appears!` });


      // Key
      //---------------------
    } else if (type === 'key') {
      const keyType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'key');

      if (!keyType) {
        socket.emit('output', { message: 'Unknown key type.' });
        return;
      }

      let key = new Item({
        name: keyType.name,
        desc: keyType.desc,
        displayName: keyType.displayName,
        type: 'key',
      });

      socket.user.keys.push(key);
      socket.user.save();
      socket.emit('output', { message: 'Key created.' });
    }

    // Invalid
    //---------------------
    else {
      socket.emit('output', { message: 'Unknown object type.' });
      return;
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">spawn mob &lt;mob name&gt; </span><span class="purple">-</span> Create <mob> in current room.<br />';
    output += '<span class="mediumOrchid">spawn item &lt;item name&gt; </span><span class="purple">-</span> Create <item> in inventory.<br />';
    socket.emit('output', { message: output });
  },
};
