export class Direction {
  constructor(obj) {
    this.short = obj.short;
    this.long = obj.long;
    this.desc = obj.desc;
  }
}

const privateDirEnum = {
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
privateDirEnum.N.opposite = privateDirEnum.S;
privateDirEnum.S.opposite = privateDirEnum.N;
privateDirEnum.E.opposite = privateDirEnum.W;
privateDirEnum.W.opposite = privateDirEnum.E;
privateDirEnum.NE.opposite = privateDirEnum.SW;
privateDirEnum.NW.opposite = privateDirEnum.SE;
privateDirEnum.SE.opposite = privateDirEnum.NW;
privateDirEnum.SW.opposite = privateDirEnum.NE;
privateDirEnum.U.opposite = privateDirEnum.D;
privateDirEnum.D.opposite = privateDirEnum.U;

export const getDirection = (dir) => {
  if(!dir) return;
  if (dir.length > 2) {
    // lookup by long direction names
    return Object.values(privateDirEnum).find(d => d.long === dir.toLowerCase());
  } else {
    // lookup by short direction names
    const key = dir.toUpperCase();
    return privateDirEnum[key];
  }
};

const handler = {
  get: (obj, prop) => {
    if(!(prop in obj)) {
      throw new TypeError(`Invalid enum value: ${prop.toString()}`);
    }
    return obj[prop];
  },
  set: () => {
    throw new TypeError('Cannot set value of enum');
  },
};

const directions = new Proxy(privateDirEnum, handler);
export default directions;
