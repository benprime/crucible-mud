export class Direction {
  constructor(obj) {
    this.short = obj.short;
    this.long = obj.long;
    this.desc = obj.desc;
  }
}

const directions = {
  N: new Direction({
    short: 'n',
    long: 'north',
    desc: 'to the north',
    // an idea, that would allow for comparisons of dirInput == dirObj (may overcomplicate things)
    //toString: function() { return this.short; },
  }),
  S: new Direction({
    short: 's',
    long: 'south',
    desc: 'to the south',
  }),
  E: new Direction({
    short: 'e',
    long: 'east',
    desc: 'to the east',
  }),
  W: new Direction({
    short: 'w',
    long: 'west',
    desc: 'to the west',
  }),
  NE: new Direction({
    short: 'ne',
    long: 'northeast',
    desc: 'to the northeast',
  }),
  NW: new Direction({
    short: 'nw',
    long: 'northwest',
    desc: 'to the northwest',
  }),
  SE: new Direction({
    short: 'se',
    long: 'southeast',
    desc: 'to the southeast',
  }),
  SW: new Direction({
    short: 'sw',
    long: 'southwest',
    desc: 'to the southwest',
  }),
  U: new Direction({
    short: 'u',
    long: 'up',
    desc: 'from above',
  }),
  D: new Direction({
    short: 'd',
    long: 'down',
    desc: 'from below',
  }),
};

// add opposite directions
directions.N.opposite = directions.S;
directions.S.opposite = directions.N;
directions.E.opposite = directions.W;
directions.W.opposite = directions.E;
directions.NE.opposite = directions.SW;
directions.NW.opposite = directions.SE;
directions.SE.opposite = directions.NW;
directions.SW.opposite = directions.NE;
directions.U.opposite = directions.D;
directions.D.opposite = directions.U;

Object.freeze(directions);

export const getDirection = (dir) => {
  if(!dir) return;
  if (dir.length > 2) {
    // lookup by long direction names
    return Object.values(directions).find(d => d.long === dir.toLowerCase());
  } else {
    // lookup by short direction names
    const key = dir.toUpperCase();
    return directions[key];
  }
};

export default directions;
