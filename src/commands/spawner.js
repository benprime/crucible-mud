import Room from '../models/room';
import Mob from '../models/mob';
import config from '../config';
import mobData from '../data/mobData';
import dice from '../core/dice';

// Not sure if the global server code should really be living with
// the command, but it's okay here for now.
setInterval(() => {

  const now = Date.now();

  // loop through rooms that contain spawners...
  const roomsWithSpawners = Object.values(Room.roomCache).filter(({spawner}) => spawner && spawner.timeout);
  roomsWithSpawners.forEach(room => {
    let max = room.spawner.max ? room.spawner.max : config.DEFAULT_ROOM_MOB_MAX;
    let timeout = room.spawner.timeout ? room.spawner.timeout : config.ROUND_DURATION;

    if (!room.spawnTimer) {
      room.spawnTimer = now;
    }

    // TODO: This appears to spawn mobs back to back without waiting for timeout between spawns
    // when the count of mobs is less than max.
    if (room.mobs.length < max && now - room.spawnTimer >= timeout && room.spawner.mobTypes.length > 0) {
      let mobTypeIndex = dice.getRandomNumber(0, room.spawner.mobTypes.length);
      let mobTypeName = room.spawner.mobTypes[mobTypeIndex];
      let mobType = mobData.catalog.find(({name}) => name.toLowerCase() === mobTypeName.toLowerCase());
      let mob = new Mob(mobType, room.id);

      // update time whenever we spawn a mob
      room.spawnTimer = now;

      room.mobs.push(mob);
      global.io.to(room.id).emit('output', { message: `<span class="yellow">A ${mobType.displayName} appears!</span>` });
    }

  });
}, config.SPAWNER_INTERVAL);

export default {
  name: 'spawner',
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
    this.execute(socket, match[1], match[2]);
  },

  execute(socket, action, param) {
    const room = Room.getById(socket.user.roomId);
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
        addMobType = mobData.catalog.find(({name}) => name.toLowerCase() === param.toLowerCase());
        if(!addMobType) {
          socket.emit('output', { message: 'Invalid mobType.' });
          break;
        }
        room.spawner.mobTypes.push(addMobType.name);
        room.save();
        socket.emit('output', { message: 'Creature added to spawner.' });
        break;
      case 'remove':
        removeMobType = mobData.catalog.find(({name}) => name.toLowerCase() === param.toLowerCase());
        if(!removeMobType) {
          socket.emit('output', { message: 'Invalid mobType.' });
          break;
        }
        index = room.spawner.mobTypes.indexOf(removeMobType.name);
        if (index !== -1) {
          room.spawner.mobTypes.splice(index);
          room.save();
          socket.emit('output', { message: 'Creature removed from spawner.' });
        } else {
          socket.emit('output', { message: 'Creature not found on spawner.' });
        }
        break;
      case 'max':
        maxVal = parseInt(param);
        if(isNaN(maxVal)) {
          socket.emit('output', { message: 'Invalid max value - must be an integer.' });
          break;
        }
        room.spawner.max = maxVal;
        room.save();
        socket.emit('output', { message: `Max creatures updated to ${maxVal}.` });
        break;
      case 'timeout':
        timeoutVal = parseInt(param);
        if(isNaN(timeoutVal)) {
          socket.emit('output', { message: 'Invalid max value - must be an integer.' });
          break;
        }
        room.spawner.timeout = timeoutVal;
        room.save();
        socket.emit('output', { message: `Timeout updated to ${timeoutVal}.` });
        break;
      case 'clear':
        room.spawner = null;
        room.save();
        socket.emit('output', { message: 'Spawner cleared.' });
        break;
      case 'copy':
        socket.user.spawnerClipboard = room.spawner;
        socket.emit('output', { message: 'Spawner copied.' });
        break;
      case 'paste':
        room.spawner = socket.user.spawnerClipboard;
        socket.emit('output', { message: 'Spawner pasted.' });
        break;
      default:
        desc = room.spawner ? room.spawner.toString() : 'None.';
        socket.emit('output', { message: desc });
    }

  },

  help(socket) {
    let output = '<span class="mediumOrchid">spawner </span><span class="purple">-</span> Show spawner settings for current room.<br />';
    output += '<span class="mediumOrchid">spawner &lt;add&gt; </span><span class="purple">-</span> Add creature to the current room\'s spawner.<br />';
    output += '<span class="mediumOrchid">spawner &lt;remove&gt; </span><span class="purple">-</span> Remove a creature from the current room\'s spawner.<br />';
    output += '<span class="mediumOrchid">spawner &lt;max&gt; </span><span class="purple">-</span> Set max number of creatures for this room.<br />';
    output += '<span class="mediumOrchid">spawner &lt;timeout&gt; </span><span class="purple">-</span> Set timeout from creature death until next spawn.<br />';
    output += '<span class="mediumOrchid">spawner &lt;clear&gt; </span><span class="purple">-</span> Clear all spawner settings for this room.<br />';
    output += '<span class="mediumOrchid">spawner &lt;copy&gt; </span><span class="purple">-</span> Copy the current room\'s spawner settings.<br />';
    output += '<span class="mediumOrchid">spawner &lt;paste&gt; </span><span class="purple">-</span> Paste a room\'s spawner settings.<br />';
    socket.emit('output', { message: output });
  },
};
