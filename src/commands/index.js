import commandManager from '../core/commandManager';
import { globalErrorHandler } from '../config';

const commandModules = [
  'accept.js',
  'aid.js',
  'attack.js',
  'break.js',
  'buy.js',
  'catalog.js',
  'close.js',
  
  'createArea.js',
  'createDoor.js',
  'createRoom.js',
  'create.js', // this contains the catch-all for the other create commands and must be last.
  
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
  'puppet.js',
  'rest.js',
  'roll.js',
  'say.js',
  'search.js',
  'sell.js',
  'set.js',
  'sneak.js',
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
  dispatch(socket, input) {
    try {
      commandManager.processDispatch(socket, input)
        .catch(err => globalErrorHandler(err));
    } catch (err) {
      globalErrorHandler(err);
    }
  },
};
