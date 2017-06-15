
module.exports = {
  catalog: [
    {
      name: "shortsword",
      displayName: "short sword",
      desc: "an iron short sword",
      equip: "mainHand",  //mainHand/offHand/bothHand/eitherHand, head, non, etc
      damage: "1d6 + 0",  //die roll + modifier
      type: "slashing",  //piercing, slashing, bludgeoning
      speed: 0,  //scale from -1(slowest) to 1(fastest)
      bonus: "damage + 0" //stat + modifier
    },
  ]
};