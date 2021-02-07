import Item from '../models/item';

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
    class: 'sentry',
    desc: 'an ugly kobold',
    displayTemplate: '${this.adjective} ${this.name} ${this.class}',
    damage: '1d2',
    adjectives: [
      {
        name: 'big',
        modifiers: {
          hp: 10,
          xp: 0,
          hitDice: 0,
          attacksPerRound: 0.25,
          tauntsPerRound: 0.25,
        },
      },
      {
        name: 'strong',
        modifiers: {
          hp: 5,
          xp: 30,
          hitDice: 0,
          attacksPerRound: 0.25,
          tauntsPerRound: 0.25,
        },
      },
      {
        name: 'quick',
        modifiers: {
          hp: 0,
          xp: 0,
          hitDice: 0,
          attacksPerRound: -0.25,
          tauntsPerRound: -0.25,
        },
      },
      {
        name: 'small',
        modifiers: {
          hp: -5,
          xp: -5,
          hitDice: 0,
          attacksPerRound: -0.125,
          tauntsPerRound: -0.125,
        },
      },
      {
        name: 'short',
        modifiers: {
          hp: 0,
          xp: 0,
          hitDice: 0,
          attacksPerRound: -0.25,
          tauntsPerRound: -0.25,
        },
      },
      {
        name: 'tall',
        modifiers: {
          hp: 0,
          xp: 0,
          hitDice: 0,
          attacksPerRound: 0.25,
          tauntsPerRound: 0.25,
        },
      },
      {
        name: 'ferocious',
        modifiers: {
          hp: 0,
          xp: 50,
          hitDice: 1,
          attacksPerRound: 0.50,
          tauntsPerRound: 0.50,
        },
      },
    ],
    attacksPerRound: 1,
    hitDice: '1d4',
    hp: 10,
    xp: 20,
    tauntsPerRound: 3,
    deathMessage: 'The {0} crumbles to dust.',
    taunts: [
      'The {0} growls at {1} aggressively!',
      'The {0} circles {1}, looking for an opening!',
      'The {0} bellows a challenge!',
    ],
  },
  {
    name: 'cultist',
    class: 'robed',
    desc: 'a robed cultist',
    damage: '1d2',
    displayTemplate: '${this.adjective} ${this.class} ${this.name}',
    adjectives: [
      {
        name: 'big',
        modifiers: {
          hp: 10,
          xp: 0,
          hitDice: 0,
          attacksPerRound: 0.25,
          tauntsPerRound: 0.25,
        },
      },
      {
        name: 'strong',
        modifiers: {
          hp: 5,
          xp: 30,
          hitDice: 0,
          attacksPerRound: 0.25,
          tauntsPerRound: 0.25,
        },
      },
      {
        name: 'quick',
        modifiers: {
          hp: 0,
          xp: 0,
          hitDice: 0,
          attacksPerRound: -0.25,
          tauntsPerRound: -0.25,
        },
      },
      {
        name: 'small',
        modifiers: {
          hp: -5,
          xp: -5,
          hitDice: 0,
          attacksPerRound: -0.125,
          tauntsPerRound: -0.125,
        },
      },
      {
        name: 'short',
        modifiers: {
          hp: 0,
          xp: 0,
          hitDice: 0,
          attacksPerRound: -0.25,
          tauntsPerRound: -0.25,
        },
      },
      {
        name: 'tall',
        modifiers: {
          hp: 0,
          xp: 0,
          hitDice: 0,
          attacksPerRound: 0.25,
          tauntsPerRound: 0.25,
        },
      },
      {
        name: 'ferocious',
        modifiers: {
          hp: 0,
          xp: 50,
          hitDice: 1,
          attacksPerRound: 0.50,
          tauntsPerRound: 0.50,
        },
      },
    ],

    attacksPerRound: 1,
    hitDice: '1d4',
    hp: 10,
    xp: 20,
    tauntsPerRound: 3,
    deathMessage: 'The {0} crumbles to dust.',
    taunts: [
      'The {0} growls at {1} aggressively!',
      'The {0} circles {1}, looking for an opening!',
      'The {0} bellows a challenge!',
    ],
  },
  {
    name: 'hellhound',
    desc: 'a hellhound',
    displayTemplate: '${this.adjective} ${this.name}',
    adjectives: [
      {
        name: 'flaming',
        modifiers: {
          hp: 10,
          xp: 0,
          hitDice: 0,
          attacksPerRound: 250,
        },
      },
      {
        name: 'smoldering',
        modifiers: {
          hp: 10,
          xp: 0,
          hitDice: 0,
          attacksPerRound: 250,
        },
      },
    ],
    attacksPerRound: 1,
    hitDice: '1d4',
    hp: 10,
    xp: 20,
    tauntsPerRound: 3,
    deathMessage: 'The {0} crumbles to dust.',
    taunts: [
      'The {0} growls at {1} aggressively!',
      'The {0} circles {1}, looking for an opening!',
      'The {0} bellows a challenge!',
    ],
  },
  {
    name: 'pig',
    desc: 'Dirty. Filthy. Delicious.',
    damage: '1d2',
    displayTemplate: '${this.adjective} ${this.name}',
    adjectives: [
      {
        name: 'naughty',
        modifiers: {
          hp: 5,
          xp: 0,
          hitDice: 0,
          attacksPerRound: 0.25,
          tauntsPerRound: 0.25,
          drops: [new Item({
            name: 'pork belly',
            desc: 'layers of raw fat and muscle from a pig',
            type: 'item',
            hidden: false,
          }), new Item({
            name: 'handkerchief',
            desc: 'a square piece of thin fabric',
            type: 'item',
            hidden: false,
          })],
        },
      },
    ],

    attacksPerRound: 1,
    hitDice: '1d4',
    hp: 10,
    xp: 5,
    tauntsPerRound: 3,
    deathMessage: 'The {0} squeals and collapses.',
    taunts: [
      'The {0} oinks at {1} aggressively!',
      'The {0} hops around {1}, looking for an opening!',
      'The {0} squeals angrily!',
    ],
  },
  {
    name: 'enchanted sparring dummy',
    desc: 'a sparring dummy',
    attacksPerRound: 0, // no attacks
    hp: 20,
    xp: 20,
    hitDice: '4d6',
    idleInterval: 60000, // every minute
    idleActions: [
      'The {0} sighs.',
      'The {0} looks around hopefully.',
      'The {0} asks "Want to punch me in the face?"',
    ],
    tauntsPerRound: 4,
    taunts: [
      'The {0} shouts "You really could do better!"',
      'The {0} shrugs.',
      'The {0} whines "Oh sure, beat up on the dummy!"',
    ],
  },
  {
    name: 'flesh golem',
    desc: 'hideous patchwork of lumbering flesh stitched together by twine and animated by necromancy.',
    attacksPerRound: 0.5,
    tauntsPerRound: 1,
    damage: '1d3+1',
    hitDice: '4d6',
    hp: 500,
    xp: 800,
    taunts: [
      'The {0} gurgles menacingly!',
      'The {0} lumbers in your direction.',
      'The {0} roars a throaty howl of pain and rage.',
    ],
  }],
};
