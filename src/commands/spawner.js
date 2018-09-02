import Room from '../models/room';
import Mob from '../models/mob';
import config from '../config';
import mobData from '../data/mobData';
import dice from '../core/dice';
import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';

// Not sure if the global server code should really be living with
// the command, but it's okay here for now.
setInterval(() => {

  const now = Date.now();

  // loop through rooms that contain spawners...
  const roomsWithSpawners = Object.values(Room.roomCache).filter(({ spawner }) => spawner && spawner.timeout);
  roomsWithSpawners.forEach(room => {
    let max = room.spawner.max ? room.spawner.max : config.DEFAULT_ROOM_MOB_MAX;
    let timeout = room.spawner.timeout ? room.spawner.timeout : config.ROUND_DURATION;

    if (!room.spawnTimer) {
      room.spawnTimer = now;
    }

    if (room.mobs.length < max && now - room.spawnTimer >= timeout && room.spawner.mobTypes.length > 0) {
      let mobTypeIndex = dice.getRandomNumber(0, room.spawner.mobTypes.length);
      let mobTypeName = room.spawner.mobTypes[mobTypeIndex];
      let mobType = mobData.catalog.find(({ name }) => name.toLowerCase() === mobTypeName.toLowerCase());
      let mob = new Mob(mobType, room.id);

      // update time whenever we spawn a mob
      room.spawnTimer = now;

      room.mobs.push(mob);
      socketUtil.roomMessage(room.id, `<span class="yellow">A ${mob.displayName} appears!</span>`);
    }

  });
}, config.SPAWNER_INTERVAL);

export default {
  name: 'spawner',
  desc: 'create and set mob spawner in the current room',
  category: commandCategories.world,
  admin: true,

  patterns: [
    /^spawner$/i,
    /^spawner\s+(add)\s+(\w+)$/i,
    /^spawner\s+(remove)\s+(\w+)$/i,
    /^spawner\s+(max)\s+(\d+)$/i,
    /^spawner\s+(timeout)\s+(\d+)$/i,
    /^spawner\s+(clear)$/i,
    /^spawner\s+(copy)$/i,
    /^spawner\s+(paste)$/i,
    /^spawner\s+$/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1], match[2]);
  },

  execute(character, action, param) {
    const room = Room.getById(character.roomId);
    action = action ? action.toLowerCase() : null;

    if (!room.spawner) {
      room.spawner = {};
    }

    let addMobType;
    let removeMobType;
    let index;
    let desc;
    let maxVal;
    let timeoutVal;

    switch (action) {
      case 'add':
        addMobType = mobData.catalog.find(({ name }) => name.toLowerCase() === param.toLowerCase());
        if (!addMobType) {
          character.output('Invalid mobType.');
          return Promise.reject();
        }
        room.spawner.mobTypes.push(addMobType.name);
        room.save(err => { if (err) throw err; });
        character.output('Creature added to spawner.');
        return Promise.resolve();
      case 'remove':
        removeMobType = mobData.catalog.find(({ name }) => name.toLowerCase() === param.toLowerCase());
        if (!removeMobType) {
          character.output('Invalid mobType.');
          return Promise.reject();
        }
        index = room.spawner.mobTypes.indexOf(removeMobType.name);
        if (index !== -1) {
          room.spawner.mobTypes.splice(index);
          room.save(err => { if (err) throw err; });
          character.output('Creature removed from spawner.');
          return Promise.resolve();
        } else {
          character.output('Creature not found on spawner.');
          return Promise.reject();
        }
      case 'max':
        maxVal = parseInt(param);
        if (isNaN(maxVal)) {
          character.output('Invalid max value - must be an integer.');
          return Promise.reject();
        }
        room.spawner.max = maxVal;
        room.save(err => { if (err) throw err; });
        character.output(`Max creatures updated to ${maxVal}.`);
        return Promise.resolve();
      case 'timeout':
        timeoutVal = parseInt(param);
        if (isNaN(timeoutVal)) {
          character.output('Invalid max value - must be an integer.');
          return Promise.reject();
        }
        room.spawner.timeout = timeoutVal;
        room.save(err => { if (err) throw err; });
        character.output(`Timeout updated to ${timeoutVal}.`);
        return Promise.resolve();
      case 'clear':
        room.spawner = null;
        room.save(err => { if (err) throw err; });
        character.output('Spawner cleared.');
        return Promise.resolve();
      case 'copy':
        character.spawnerClipboard = room.spawner;
        character.output('Spawner copied.');
        return Promise.resolve();
      case 'paste':
        room.spawner = character.spawnerClipboard;
        character.output('Spawner pasted.');
        return Promise.resolve();
      default:
        desc = room.spawner ? room.spawner.toString() : 'None.';
        character.output(desc);
        character.output();
        return Promise.resolve();
    }
  },

  help(character) {
    let output = '<span class="mediumOrchid">spawner </span><span class="purple">-</span> Show spawner settings for current room.<br />';
    output += '<span class="mediumOrchid">spawner add &lt;mob type&gt; </span><span class="purple">-</span> Add creature to the current room\'s spawner.<br />';
    output += '<span class="mediumOrchid">spawner remove &lt;mob type&gt; </span><span class="purple">-</span> Remove a creature from the current room\'s spawner.<br />';
    output += '<span class="mediumOrchid">spawner max &lt;count&gt; </span><span class="purple">-</span> Set max number of creatures for this room.<br />';
    output += '<span class="mediumOrchid">spawner timeout &lt;milleseconds&gt; </span><span class="purple">-</span> Set timeout from creature death until next spawn.<br />';
    output += '<span class="mediumOrchid">spawner clear </span><span class="purple">-</span> Clear all spawner settings for this room.<br />';
    output += '<span class="mediumOrchid">spawner copy </span><span class="purple">-</span> Copy the current room\'s spawner settings.<br />';
    output += '<span class="mediumOrchid">spawner paste </span><span class="purple">-</span> Paste a room\'s spawner settings.<br />';
    character.output(output);
  },
};
