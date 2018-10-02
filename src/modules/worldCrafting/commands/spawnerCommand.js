import Room from '../../../models/room';
import Mob from '../../../models/mob';
import config, { globalErrorHandler } from '../../../config';
import mobData from '../../../data/mobData';
import dice from '../../../core/dice';
import socketUtil from '../../../core/socketUtil';


// Not sure if the global server code should really be living with
// the command, but it's okay here for now.
setInterval(() => {

  // todo: move this into a manager method and call it from the normal game loop
  try {

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

  } catch (err) {
    globalErrorHandler(err);
  }

}, config.SPAWNER_INTERVAL);

export default {
  name: 'spawner',
  desc: 'create and set mob spawner in the current room',

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

  parseParams(match) {
    if(match.length < 3) return false;
    return [this.name];
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
