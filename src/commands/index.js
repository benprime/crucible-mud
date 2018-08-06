import actionHandler from '../core/actionHandler';
import helpHandler from './help';

let commandModules = [
  'attack.js',
  'break.js',
  'close.js',
  'create.js',
  'destroy.js',
  'drop.js',
  'equip.js',
  'exp.js',
  'follow.js',
  'gossip.js',
  'hide.js',
  'help.js',
  'inventory.js',
  'invite.js',
  'keys.js',
  'list.js',
  'lock.js',
  'look.js',
  'move.js',
  'offer.js',
  'open.js',
  'roll.js',
  'say.js',
  'search.js',
  'set.js',
  'spawner.js',
  'spawn.js',
  'stats.js',
  'summon.js',
  'take.js',
  'telepathy.js',
  'teleport.js',
  'unequip.js',
  'unlock.js',
  'who.js',
  'yell.js',
];
const commands = [];
let defaultCommand;

function validateCommand(commandHandler, file) {
  if(!commandHandler) throw `could not load ${file} when initializing commands`;
  if (!commandHandler.name) throw `command ${file} missing name!`;
  if (!commandHandler.dispatch) throw `command ${file} missing dispatch!`;
  if (!commandHandler.execute) throw `command ${file} missing execute!`;
  if (!commandHandler.patterns) throw `command ${file} missing patterns!`;
  if (!commandHandler.help) throw `command ${file} missing help!`;
}

commandModules.forEach(file => {
  // eslint-disable-next-line
  let commandHandler = require(`./${file}`).default;
  //console.log(commandHandler)
  validateCommand(commandHandler, file);
  commands.push(commandHandler);
  helpHandler.registerCommand(commandHandler);
});

defaultCommand = commands.find(({name}) => name === 'say');

function matches({patterns}, input) {
  for (let p = 0; p < patterns.length; p++) {
    let match = input.match(patterns[p]);
    if (match) {
      return match;
    }
  }
}

function processDispatch(socket, input) {
  input = input.trim();
  // check if input string matches any of our matching patterns.
  // then call the handler with the input, socket
  for (let h = 0; h < commands.length; h++) {
    let match = matches(commands[h], input);
    if (match) {
      if (!commands[h].admin || socket.user.admin) {
        commands[h].dispatch(socket, match);
        return;
      }
    }
  }

  // handle player actions (emotes)
  const actionRegex = /^(\w+)\s?(.*)$/i;
  let match = input.match(actionRegex);
  if (match) {
    let action = match[1];
    let username = match[2];
    const actionFound = actionHandler.actionDispatcher(socket, action, username);
    if (actionFound) {
      return;
    }
  }
  // when a command is not found, it defaults to "say"
  defaultCommand.execute(socket, input);
}

export default {
  Dispatch(socket, input) {
    try {
      processDispatch(socket, input);
    } catch (e) {
      socket.emit('output', { message: `AN ERROR OCCURED!\n${e.message}` });
      console.error(e);
      console.error(new Error().stack);
    }
  },
};
