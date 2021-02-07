import Room from '../../../models/room';
import mobData from '../../../data/mobData';
import Mob from '../../../models/mob';
import itemData from '../../../data/itemData';
import Item from '../../../models/item';
import questData from '../../../data/questData';
import Quest from '../../../models/quest';

export const spawnItem = (itemType) => {
  return new Item({
    name: itemType.name,
    desc: itemType.desc,
    type: itemType.type,
    fixed: itemType.fixed,
    equipSlots: itemType.equipSlots,
    damage: itemType.damage,
    damageType: itemType.damageType,
    speed: itemType.speed,
    bonus: itemType.bonus,
  });
};

export const spawnQuest = (questType) => {
  return new Quest({
    name: questType.name,
    synopsis: questType.desc,
    currentStep: questType.currentStep,
    success: questType.success,
    steps: questType.steps,
  });
};

export const spawnAndGiveQuest = (character, questType, cb) => {
  const quest = spawnQuest(questType);

  character.quests.push(quest);
  character.save((err, character) => {
    if (err) throw err;
    if (cb) cb(character);
  });
};

export const spawnAndGiveItem = (character, itemType, cb) => {
  const item = spawnItem(itemType);

  character.inventory.push(item);
  character.save((err, character) => {
    if (err) throw err;
    if (cb) cb(character);
  });
  return item;
};

export default {
  name: 'spawn',
  execute(character, type, name) {

    // Mob
    //---------------------
    if (type === 'mob') {
      const createType = mobData.catalog.find(mob => mob.name.toLowerCase() === name.toLowerCase());

      if (!createType) {
        character.output('Unknown mob type.');
        return false;
      }

      const room = Room.getById(character.roomId);
      if (!room) {
        character.output(`no room found for current user room: ${character.roomId}`);
        return false;
      }

      // clone the create type and give it an id
      let mob = new Mob(createType, room.id);

      room.mobs.push(mob);

      character.output('Summoning successful.');
      character.toRoom(`${character.name} waves his hand and a ${mob.displayName} appears!`, [character.id]);
      return true;

      // Item
      //---------------------
    } else if (type === 'item') {

      const itemType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');
      if (!itemType) {
        character.output(`Attempted to spawn unknown item type: ${name}`);
        return false;
      }

      spawnAndGiveItem(character, itemType);

      character.output('Item created.');
      character.toRoom(`${character.name} emits a wave of energy!`, [character.id]);
      return true;

      // Key
      //---------------------
    } else if (type === 'key') {
      const keyType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'key');

      if (!keyType) {
        character.output('Unknown key type.');
        return false;
      }

      let key = new Item({
        name: keyType.name,
        desc: keyType.desc,
        type: 'key',
      });

      character.keys.push(key);
      character.save(err => { if (err) throw err; });
      character.output('Key created.');
      return true;
    } else if (type === 'quest') {
      const quest = questData.catalog.find(quest => quest.name.toLowerCase() === name.toLowerCase());
      if (!quest) {
        character.output(`Attempted to spawn unknown quest: ${name}`);
        return false;
      }

      spawnAndGiveQuest(character, quest);

      character.output('Quest given to character.');
      character.toRoom(`${character.name} has begun a new journey!`, [character.id]);
      return true;
    }

    // Invalid
    //---------------------
    else {
      character.output('Unknown object type.');
      return false;
    }
  },
};
