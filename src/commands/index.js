const actionHandler = require('../core/actionHandler');
const helpHandler = require('./help');

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
  'say.js',
  'set.js',
  'spawner.js',
  'spawn.js',
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
  if (!commandHandler.name) throw `command ${file} missing name!`;
  if (!commandHandler.dispatch) throw `command ${file} missing dispatch!`;
  if (!commandHandler.execute) throw `command ${file} missing execute!`;
  if (!commandHandler.patterns) throw `command ${file} missing patterns!`;
  if (!commandHandler.help) throw `command ${file} missing help!`;
}

commandModules.forEach(file => {
  // eslint-disable-next-line
  let commandHandler = require(`./${file}`);
  validateCommand(commandHandler, file);
  commands.push(commandHandler);
  helpHandler.registerCommand(commandHandler);
});

defaultCommand = commands.find(h => h.name === 'say');

function matches(commandHandler, input) {
  for (let p = 0; p < commandHandler.patterns.length; p++) {
    let match = input.match(commandHandler.patterns[p]);
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

module.exports = {
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
