export default {

  // NEED MODES: Attack when attacked
  // need flags for "currently in combat" for both parties
  // -do we need to keep a list of all currently attacking people?
  // -when attacked to monsters always focus on attacker?
  // -passive/neutral monsters only attack when attacked

  // eventually, when the game gets more complicated, these monsters
  // will have stats.
  catalog: [{
    name: 'kobold',
    desc: 'an ugly kobold',
    displayName: 'kobold sentry',
    adjectives: [
      {
        name: 'big',
        modifiers: {
          hp: 10,
          xp: 0,
          minDamage: 0,
          maxDamage: 0,
          hitDice: 0,
          attackInterval: 250,
        },
      },
      {
        name: 'strong',
        modifiers: {
          hp: 5,
          xp: 30,
          minDamage: 4,
          maxDamage: 0,
          hitDice: 0,
          attackInterval: 0,
        },
      },
      {
        name: 'quick',
        modifiers: {
          hp: 0,
          xp: 0,
          minDamage: -2,
          maxDamage: 0,
          hitDice: 0,
          attackInterval: -1000,
        },
      },
      {
        name: 'small',
        modifiers: {
          hp: -5,
          xp: -5,
          minDamage: 0,
          maxDamage: 0,
          hitDice: 0,
          attackInterval: -500,
        },
      },
      {
        name: 'short',
        modifiers: {
          hp: 0,
          xp: 0,
          minDamage: 0,
          maxDamage: 0,
          hitDice: 0,
          attackInterval: 0,
        },
      },
      {
        name: 'tall',
        modifiers: {
          hp: 0,
          xp: 0,
          minDamage: 0,
          maxDamage: 0,
          hitDice: 0,
          attackInterval: 0,
        },
      },
      {
        name: 'ferocious',
        modifiers: {
          hp: 0,
          xp: 50,
          minDamage: 2,
          maxDamage: 2,
          hitDice: 1,
          attackInterval: 0,
        },
      },
    ],
    attackInterval: 4000,
    hitDice: '1d4',
    hp: 10,
    xp: 20,
    minDamage: 1,
    maxDamage: 3,
    tauntInterval: 12000, // every 3 rounds
    deathMessage: 'The {0} crumbles to dust.',
    taunts: [
      'The {0} growls at {1} aggressively!',
      'The {0} circles {1}, looking for an opening!',
      'The {0} bellows a challenge!',
    ],
  }, {
    name: 'dummy',
    desc: 'a sparring dummy',
    displayName: 'enchanted sparring dummy',
    attackInterval: 0, // no attacks
    hp: 20,
    xp: 20,
    hitDice: '4d6',
    idleInterval: 60000, // every minute
    idleActions: [
      'The {0} sighs.',
      'The {0} looks at {1} hopefully.',
      'The {0} asks "Want to punch me in the face?"',
    ],
    tauntInterval: 12000,
    taunts: [
      'The {0} shouts "You really could do better!"',
      'The {0} shrugs.',
      'The {0} whines "Oh sure, beat up on the dummy!"',
    ],
  }],
};
