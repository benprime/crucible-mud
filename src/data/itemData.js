const DamageTypes = {
  NONE: 'none',
  SLASHING: 'slashing',
  PIERCING: 'pierce',
  BLUDGEONING: 'bludgeoning',
};

const EquipSlots = {
  HEAD: 'head',
  NECK: 'neck',
  BODY: 'body',
  LEGS: 'legs',
  ARMS: 'arms',
  HANDS: 'hands',
  FEET: 'feet',
  FINGERMAIN: 'fingerMain',
  FINGEROFF: 'fingerOff',
  WEAPONMAIN: 'weaponMain',
  WEAPONOFF: 'weaponOff',
};

export default {
  catalog: [
    {
      name: 'short sword',
      desc: 'an iron short sword',
      price: 10,
      type: 'item',
      equipSlots: [EquipSlots.WEAPONMAIN],
      damage: '1d5+1',  //die roll + modifier
      damageType: DamageTypes.SLASHING,  //piercing, slashing, bludgeoning
      attackStat: 'STR',
      //speed: 0,  //scale from -1(slowest) to 1(fastest)
      //bonus: 'damage + 0', //stat + modifier
    },
    {
      name: 'great sword',
      desc: 'a huge sword requiring both hands to wield',
      price: 10,
      type: 'item',
      equipSlots: [EquipSlots.WEAPONMAIN, EquipSlots.WEAPONOFF],
      damage: '1d6+3',  //die roll + modifier
      damageType: DamageTypes.SLASHING,  //piercing, slashing, bludgeoning
      attackStat: 'STR',
      //speed: 0,  //scale from -1(slowest) to 1(fastest)
      //bonus: 'damage + 0', //stat + modifier
    },
    {
      name: 'jade key',
      desc: 'a key made out of jade',
      price: 10,
      type: 'key',
    },
    {
      name: 'torch',
      desc: 'a flaming stick',
      price: 10,
      type: 'item',
      equipSlots: [EquipSlots.WEAPONOFF],  //mainHand/offHand/bothHand/eitherHand, head, non, etc
      damage: '1d2',  //die roll (+/-)modifier
      damageType: DamageTypes.BLUDGEONING,  //piercing, slashing, bludgeoning
      attackStat: 'STR',
      //speed: -.5,  //scale from -1(slowest) to 1(fastest)
      //bonus: 'damage + 1d4 fire', //stat + modifier
    },
    {
      name: 'helmet',
      desc: 'a light combat helmet',
      price: 10,
      type: 'item',
      equipSlots: [EquipSlots.HEAD],  //mainHand/offHand/bothHand/eitherHand, head, non, etc
      //speed: -.5,  //scale from -1(slowest) to 1(fastest)
      //bonus: 'damage + 1d4 fire', //stat + modifier
    },
    {
      name: 'padded leather armor',
      desc: 'padded leather armor',
      price: 10,
      type: 'item',
      equipSlots: [EquipSlots.BODY],
    },
    {
      name: 'padded leather pants',
      desc: 'padded leather pants',
      price: 10,
      type: 'item',
      equipSlots: [EquipSlots.LEGS],
    },
    {
      name: 'leather boots',
      desc: 'leather boots',
      price: 10,
      type: 'item',
      equipSlots: [EquipSlots.FEET],
    },
    {
      name: 'leather gloves',
      desc: 'leather gloves',
      price: 10,
      type: 'item',
      equipSlots: [EquipSlots.HANDS],
    },
    {
      name: 'sign',
      fixed: true,
      desc: 'The sign reads \'Hi, I\'m a sign.\'',
      type: 'item',
    },
  ],
};
