export const commands = {};

export const commandCategories = Object.freeze({
  item: { name: 'Item Commands', silent: false, restricted: false },
  combat: { name: 'Combat Commands', silent: false, restricted: false },
  shop: { name: 'Shop Commands', silent: false, restricted: false },
  door: { name: 'Door Commands', silent: false, restricted: false },
  character: { name: 'Character Commands', silent: true, restricted: false },
  system: { name: 'System Commands', silent: true, restricted: false },
  communication: { name: 'Room Communication Commands', silent: false, restricted: false },
  party: { name: 'Party Commands', silent: true, restricted: false },
  basic: { name: 'Basic Commands', silent: false, restricted: false },
  special: { name: 'Special Use Commands', silent: false, restricted: false },
  world: { name: 'World Crafting Commands', silent: false, restricted: true },
  admin: { name: 'Admin Commands', silent: false, restricted: true },
});

export default {
  commands,
  commandCategories,
};