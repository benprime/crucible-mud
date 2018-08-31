import commandManager from '../core/commandManager';
import config from '../config';

const commandModules = [
  'accept.js',
  'aid.js',
  'attack.js',
  'break.js',
  'buy.js',
  'catalog.js',
  'close.js',
  'create.js',
  'destroy.js',
  'drag.js',
  'drop.js',
  'equip.js',
  'exp.js',
  'follow.js',
  'gossip.js',
  'health.js',
  'help.js',
  'hide.js',
  'inventory.js',
  'invite.js',
  'keys.js',
  'kick.js',
  'list.js',
  'lock.js',
  'look.js',
  'move.js',
  'offer.js',
  'open.js',
  'party.js',
  'rest.js',
  'roll.js',
  'say.js',
  'search.js',
  'sell.js',
  'set.js',
  'spawner.js',
  'spawn.js',
  'stats.js',
  'stock.js',
  'summon.js',
  'take.js',
  'telepathy.js',
  'teleport.js',
  'track.js',
  'unequip.js',
  'uninvite.js',
  'unlock.js',
  'who.js',
  'yell.js',
];

commandManager.loadCommands(commandModules);
commandManager.setDefaultCommand('say');

export default {
  Dispatch(socket, input) {

    if (!config.THROW_EXCEPTIONS) {
      try {
        commandManager.processDispatch(socket, input);
      } catch (e) {
        socket.emit('output', { message: `AN ERROR OCCURED!\n${e.message}` });
        console.error(e);
        console.error(new Error().stack);
      }
    } else {
      commandManager.processDispatch(socket, input);
    }
  },
};
