
module.exports = {
  catalog: [
    {
      name: "shortsword",
      displayName: "short sword",
      desc: "an iron short sword",
      type: "item",

      equip: "mainHand",  //mainHand or offHand or bothHand or eitherHand
      damage: "1d6 + 0",  //die roll + modifier
      //type: "slashing",  //piercing, slashing, bludgeoning
      speed: 0,  //scale from -1(slowest) to 1(fastest)
      bonus: "damage + 0" //stat + modifier
    },
    {
      name: "jadekey",
      displayName: "jade key",
      desc: "a key made out of jade",
      type: "key",
    },
  ]
};