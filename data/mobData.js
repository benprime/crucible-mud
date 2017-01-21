module.exports = {

  // NEED MODES: Attack when attacked
  // need flags for "currently in combat" for both parties
  // -do we need to keep a list of all currently attacking people?
  // -when attacked to monsters always focus on attacker?
  // -passive/neutral monsters only attack when attacked

  // eventually, when the game gets more complicated, these monsters
  // will have stats.
  catalog: [{
    name: "kobold",
    displayName: "kobold sentry",
    adjectives: [
      "big", "small", "short", "tall"
    ],
    attackInterval: 4000,
    hitDice: "1d4",
    hp: 10,
    minDamage: 1,
    maxDamage: 3,
    tauntInterval: 12000, // every 3 rounds
    deathMessage: "The {0} crumbles to dust.",
    taunts: [
      "The {0} growls at you aggressively!",
      "The {0} circles you, looking for an opening!",
      "The {0} bellows a challenge!"
    ]
  }, {
    name: "dummy",
    displayName: "enchanted sparring dummy",
    attackInterval: 0, // no attacks
    hp: 20,
    hitDice: "4d6",
    idleInterval: 60000, // every minute
    idleActions: [
      "The {0} sighs.",
      "The {0} looks at you hopefully.",
      "The {0} asks \"Want to punch me in the face?\"",
    ],
    tauntInterval: 12000,
    taunts: [
      "The {0} shouts \"You really could do better!\"",
      "The {0} shrugs.",
      "The {0} whines \"Oh sure, beat up on the dummy!\""
    ]
  }]
}
