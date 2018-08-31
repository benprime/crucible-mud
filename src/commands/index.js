import emoteHandler from '../core/emoteHandler';
import socketUtil from '../core/socketUtil';
import config from '../config';
import { commands } from '../core/commandManager';


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

function validateCommand(commandHandler, file) {
  if (!commandHandler) throw `could not load ${file} when initializing commands`;
  if (!commandHandler.name) throw `command ${file} missing name!`;
  if (!commandHandler.dispatch) throw `command ${file} missing dispatch!`;
  if (!commandHandler.execute) throw `command ${file} missing execute!`;
  if (!commandHandler.patterns) throw `command ${file} missing patterns!`;
  if (!commandHandler.help) throw `command ${file} missing help!`;
  if (!commandHandler.category) throw `command ${file} missing category!`;
}

commandModules.forEach(file => {
  // eslint-disable-next-line
  let commandHandler = require(`./${file}`).default;
  validateCommand(commandHandler, file);
  //commands.push(commandHandler);
  commands[commandHandler.name] = commandHandler;
});

const defaultCommand = commands['say'];

function checkPatterns(patterns, input) {
  for (let pattern of patterns) {
    let match = input.match(pattern);
    if (match) {
      return match;
    }
  }
}

function processDispatch(socket, input) {
  input = input.trim();

  if (input) {
    socket.character.output(`\n<span class="silver">&gt; ${input}</span>\n`);
  }

  // check if input string matches any of our matching patterns.
  // then call the handler with the input, socket
  for (let command of Object.values(commands)) {
    let match = checkPatterns(command.patterns, input);
    if (match) {
      if (!command.admin || socket.user.admin) {
        return command.dispatch(socket, match);
      }
    }
  }

  // emote handler
  const emoteRegex = /^(\w+)\s?(.*)$/i;
  let match = input.match(emoteRegex) || [];
  if (match) {
    let action, username;
    [, action, username] = match;
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
