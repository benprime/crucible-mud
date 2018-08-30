import emoteHandler from '../core/emoteHandler';
import socketUtil from '../core/socketUtil';
import helpHandler from './help';
import config from '../config';

let commandModules = [
  'accept.js',
  'attack.js',
  'break.js',
  'buy.js',
  'catalog.js',
  'close.js',
  'create.js',
  'destroy.js',
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
  'unequip.js',
  'unlock.js',
  'who.js',
  'yell.js',
];
const commands = [];
let defaultCommand;

function validateCommand(commandHandler, file) {
  if (!commandHandler) throw `could not load ${file} when initializing commands`;
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

defaultCommand = commands.find(({ name }) => name === 'say');

function matches({ patterns }, input) {
  for (let p = 0; p < patterns.length; p++) {
    let match = input.match(patterns[p]);
    if (match) {
      return match;
    }
  }
}

function processDispatch(socket, input) {
  input = input.trim();

  if (input) {
    socket.emit('output', { message: `\n<span class="silver">&gt; ${input}</span>\n` });
  }

  // check if input string matches any of our matching patterns.
  // then call the handler with the input, socket
  for (let h = 0; h < commands.length; h++) {
    let match = matches(commands[h], input);
    if (match) {
      if (!commands[h].admin || socket.user.admin) {
        socket.character.resetActiveBonuses(commands[h].name);
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
    if (emoteHandler.isValidAction(action)) {
      return emoteHandler.actionDispatcher(socket.character, action, username)
        .then(response => socketUtil.sendMessages(socket, response))
        .catch(response => socketUtil.output(socket, response));
    }
  }

  // when a command is not found, it defaults to "say"
  defaultCommand.execute(socket.character, input)
    .then(commandResult => socketUtil.sendMessages(socket, commandResult))
    .catch(error => socket.emit('output', { message: error }));
}

export default {
  Dispatch(socket, input) {

    if (!config.THROW_EXCEPTIONS) {
      try {
        processDispatch(socket, input);
      } catch (e) {
        socket.emit('output', { message: `AN ERROR OCCURED!\n${e.message}` });
        console.error(e);
        console.error(new Error().stack);
      }
    } else {
      processDispatch(socket, input);
    }
  },
};
