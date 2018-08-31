


const WeaponTypes = {
  None: 'none',
  Slashing: 'slashing',
  Pierce: 'pierce',
  Bludgeon: 'bludgeoning',
};

export default {
  catalog: [
    {
      name: 'short sword',
      desc: 'an iron short sword',
      price: 10,
      type: 'item',
      //range: 'melee',
      equipSlots: ['weaponMain'],
      damage: '1d5+1',  //die roll + modifier
      weaponType: 'slashing',  //piercing, slashing, bludgeoning
      //speed: 0,  //scale from -1(slowest) to 1(fastest)
      //bonus: 'damage + 0', //stat + modifier
    },
    {
      name: 'great sword',
      desc: 'a huge sword requiring both hands to wield',
      price: 10,
      type: 'item',
      //range: 'melee',
      equipSlots: ['weaponMain', 'weaponOff'],
      damage: '1d6+3',  //die roll + modifier
      weaponType: 'slashing',  //piercing, slashing, bludgeoning
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
      //range: 'melee',
      equipSlots: ['weaponOff'],  //mainHand/offHand/bothHand/eitherHand, head, non, etc
      damage: '1d2',  //die roll (+/-)modifier
      weaponType: 'bludgeoning',  //piercing, slashing, bludgeoning
      //speed: -.5,  //scale from -1(slowest) to 1(fastest)
      //bonus: 'damage + 1d4 fire', //stat + modifier
    },
    {
      name: 'sign',
      fixed: true,
      desc: 'The sign reads \'Hi, I\'m a sign.\'',
      type: 'item',
    },
  ],
};