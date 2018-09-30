/**
 * Command categories are used for organizations and to determine which
 * commands are "safe" for particular character states (ie, sneaking)
 */
export default Object.freeze({
  item: { name: 'Item Commands', restricted: false },
  combat: { name: 'Combat Commands', restricted: false },
  shop: { name: 'Shop Commands', restricted: false },
  door: { name: 'Door Commands', restricted: false },
  character: { name: 'Character Commands', restricted: false },
  core: { name: 'Core Commands', restricted: false },
  communication: { name: 'Room Communication Commands', restricted: false },
  party: { name: 'Party Commands', restricted: false },
  basic: { name: 'Basic Commands', restricted: false },
  special: { name: 'Special Use Commands', restricted: false },
  stealth: { name: 'Stealth Commands', restricted: false },
  world: { name: 'World Crafting Commands', restricted: true },
  admin: { name: 'Admin Commands', restricted: true },
});