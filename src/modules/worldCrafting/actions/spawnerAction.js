import Room from '../../../models/room';
import Mob from '../../../models/mob';
import config, { globalErrorHandler } from '../../../config';
import mobData from '../../../data/mobData';
import dice from '../../../core/dice';
import socketUtil from '../../../core/socketUtil';

export const initializeSpawnerActions = function() {
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

};

export default {
  name: 'spawner',
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
          return false;
        }
        room.spawner.mobTypes.push(addMobType.name);
        room.save(err => { if (err) throw err; });
        character.output('Creature added to spawner.');
        return true;
      case 'remove':
        removeMobType = mobData.catalog.find(({ name }) => name.toLowerCase() === param.toLowerCase());
        if (!removeMobType) {
          character.output('Invalid mobType.');
          return false;
        }
        index = room.spawner.mobTypes.indexOf(removeMobType.name);
        if (index !== -1) {
          room.spawner.mobTypes.splice(index);
          room.save(err => { if (err) throw err; });
          character.output('Creature removed from spawner.');
          return true;
        } else {
          character.output('Creature not found on spawner.');
          return false;
        }
      case 'max':
        maxVal = parseInt(param);
        if (isNaN(maxVal)) {
          character.output('Invalid max value - must be an integer.');
          return false;
        }
        room.spawner.max = maxVal;
        room.save(err => { if (err) throw err; });
        character.output(`Max creatures updated to ${maxVal}.`);
        return true;
      case 'timeout':
        timeoutVal = parseInt(param);
        if (isNaN(timeoutVal)) {
          character.output('Invalid max value - must be an integer.');
          return false;
        }
        room.spawner.timeout = timeoutVal;
        room.save(err => { if (err) throw err; });
        character.output(`Timeout updated to ${timeoutVal}.`);
        return true;
      case 'clear':
        room.spawner = null;
        room.save(err => { if (err) throw err; });
        character.output('Spawner cleared.');
        return true;
      case 'copy':
        character.spawnerClipboard = room.spawner;
        character.output('Spawner copied.');
        return true;
      case 'paste':
        room.spawner = character.spawnerClipboard;
        character.output('Spawner pasted.');
        return true;
      default:
        desc = room.spawner ? room.spawner.toString() : 'None.';
        character.output(desc);
        character.output();
        return true;
    }
  },
};
