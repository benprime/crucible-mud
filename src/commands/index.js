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
  Dispatch(socket, input) {


    function errorHandler(err) {
      socket.emit('output', { message: '--------------------------------------------' });
      socket.emit('output', { message: `AN ERROR OCCURED!\n${err.stack}` });
      socket.emit('output', { message: '--------------------------------------------' });
    }

    try {
      commandManager.processDispatch(socket, input)
        .catch(err => errorHandler(err));
    } catch (err) {
      errorHandler(err);
    }
  },
};
