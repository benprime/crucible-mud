
export default {
  catalog: [
    {
      name: 'shortsword',
      displayName: 'short sword',
      desc: 'an iron short sword',
      price: 10,
      type: 'item',
      range: 'melee',
      equip: ['weaponMain'],
      damage: '1d6 0',  //die roll + modifier
      damageType: 'slashing',  //piercing, slashing, bludgeoning
      speed: 0,  //scale from -1(slowest) to 1(fastest)
      bonus: 'damage + 0', //stat + modifier
    },
    {
      name: 'greatsword',
      displayName: 'great sword',
      desc: 'a huge sword requiring both hands to wield',
      price: 10,
      type: 'item',
      range: 'melee',
      equip: ['weaponMain', 'weaponOff'],
      damage: '1d6 0',  //die roll + modifier
      damageType: 'slashing',  //piercing, slashing, bludgeoning
      speed: 0,  //scale from -1(slowest) to 1(fastest)
      bonus: 'damage + 0', //stat + modifier
    },
    {
      name: 'jadekey',
      displayName: 'jade key',
      desc: 'a key made out of jade',
      price: 10,
      type: 'key',
    },
    {
      name: 'torch',
      displayName: 'torch',
      desc: 'a flaming stick',
      price: 10,
      type: 'item',
      range: 'melee',
      equip: ['weaponOff'],  //mainHand/offHand/bothHand/eitherHand, head, non, etc
      damage: '1d2 0',  //die roll (+/-)modifier
      damageType: 'bludgeoning',  //piercing, slashing, bludgeoning
      speed: -.5,  //scale from -1(slowest) to 1(fastest)
      bonus: 'damage + 1d4 fire', //stat + modifier
    },
    {
      name: 'sign',
      fixed: true,
      displayName: 'sign',
      desc: 'The sign reads \'Hi, I\'m a sign.\'',
      type: 'item',
    },
  ],
};