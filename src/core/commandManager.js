import socketUtil from './socketUtil';
import emoteHandler from './emoteHandler';
import characterStates from './characterStates';
import commandCategories from './commandCategories';
import { globalErrorHandler } from '../config';

/**
 * Dictionary of successfully validated and loaded commands.
 */
export const commands = {};
let defaultCommand;

/**
 * 
 * @param {Object} command
 * @param {String} file 
 */
function validateCommand(command, file) {
  if (!command) throw `could not load ${file} when initializing commands`;
  if (!command.name) throw `command ${file} missing name!`;
  if (!command.dispatch) throw `command ${file} missing dispatch!`;
  if (!command.execute) throw `command ${file} missing execute!`;
  if (!command.patterns) throw `command ${file} missing patterns!`;
  if (!command.help) throw `command ${file} missing help!`;
  if (!command.category) throw `command ${file} missing category!`;
}

function loadCommand(fileName) {
  let commandHandler = require(`../commands/${fileName}`).default;
  validateCommand(commandHandler, fileName);
  commands[commandHandler.name] = commandHandler;
}

function loadCommands(commandModules) {
  if (Object.values(commands).length !== 0) {
    throw 'Commands already initialized!';
  }
  commandModules.forEach(file => loadCommand(file));
}

function setDefaultCommand(commandName) {
  if (Object.values(commands).length === 0) {
    throw 'Must call commandManager.loadCommands() first.';
  }

  const defCommand = commands[commandName];
  if (!defCommand) {
    throw `Command not found when setting default: ${commandName}`;
  }

  defaultCommand = defCommand;
}

function matchPatterns(patterns, input) {
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
    let match = matchPatterns(command.patterns, input);
    if (match) {
      if (!command.admin || socket.user.admin) {
        // check and see if the character is in a state that
        // would prevent them from running this command.
        if (socket.character.processStates(command)) {
          return command.dispatch(socket, match);
        }
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

      // emotes are ignored by most states, but in the case of sneaking,
      // it reveals the player in the room.
      socket.character.removeState(characterStates.sneaking);

      return emoteHandler.actionDispatcher(socket.character, action, username)
        .then(response => socketUtil.sendMessages(socket, response))
        .catch(response => socket.character.output(response));
    }
  }

  // when a command is not found, it defaults to "say"
  socket.character.processStates(defaultCommand);
  return defaultCommand.execute(socket.character, input)
    .catch(error => globalErrorHandler(error));
}

export default {
  commands,
  commandCategories,
  processDispatch,
  loadCommands,
  setDefaultCommand,
};