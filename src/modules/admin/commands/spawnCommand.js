import Item from '../../../models/item';

export const spawn = (itemType) => {
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
  admin: true,

  patterns: [
    /^spawn\s+(mob)\s+(.+)$/i,
    /^spawn\s+(item)\s+(.+)$/i,
    /^spawn\s+(key)\s+(.+)$/i,
    /^spawn\s+(quest)\s+(.+)$/i,
    /^spawn\s+/i,
    /^spawn$/i,
  ],

  parseParams(match) {
    if (match.length != 3) return false;
    let typeName = match[1];
    let itemTypeName = match[2];
    return [this.name, typeName, itemTypeName];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">spawn mob &lt;mob name&gt; </span><span class="purple">-</span> Create <mob> in current room.<br />';
    output += '<span class="mediumOrchid">spawn item &lt;item name&gt; </span><span class="purple">-</span> Create <item> in inventory.<br />';
    output += '<span class="mediumOrchid">spawn quest &lt;quest name&gt; </span><span class="purple">-</span> Create <quest> for character.<br />';
    character.output(output);
  },
};
