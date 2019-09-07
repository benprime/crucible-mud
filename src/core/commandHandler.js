import socketUtil from './socketUtil';
import emoteHandler from './emoteHandler';
import characterStates from './characterStates';

/**
 * Dictionary of successfully validated and loaded commands.
 */
export const commands = {};
let defaultCommand;

/**
 *
 * @param {Object} commandModule
 * @param {String} file
 */
function validateCommand(commandModule) {
  if (!commandModule) throw 'null commandModule passed to validateCommand';
  if (!commandModule.name) throw `command ${commandModule.name} missing name!`;
  if (!commandModule.patterns) throw `command ${commandModule.name} missing patterns!`;
  if (!commandModule.parseParams) throw `command ${commandModule.name} missing parseParams!`;
  if (!commandModule.help) throw `command ${commandModule.name} missing help!`;
  if (!commandModule.category) throw `command ${commandModule.name} missing category!`;
  if (commandModule.dispatch) throw `command ${commandModule.name} should not have a dispatch method!`;
}

function loadCommands(commandModules) {
  commandModules.forEach(commandModule => {
    if (Object.values(commands).includes(commandModule)) {
      throw 'Command already loaded!';
    }
    validateCommand(commandModule, commandModule.name);
    commands[commandModule.name] = commandModule;
  });
}

function setDefaultCommand(commandName) {
  if (Object.values(commands).length === 0) {
    throw 'Must call commandHandler.loadCommands() first.';
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
      if (!command.admin || socket.character.user.admin) {

        // verify the command has been called in the proper format
        const actionInfo = command.parseParams(match, socket.character);
        if (!actionInfo) {
          command.help(socket.character);
          return;
        }

        // check and see if the character is in a state that
        // would prevent them from running this command.
        socket.character.action(actionInfo);
        return;
      }
    }
  }

  // emote handler
  const emoteRegex = /^(\w+)\s?(.*)$/i;
  let match = input.match(emoteRegex);
  if (match) {
    let action, username;
    [, action, username] = match;
    if (emoteHandler.isValidAction(action)) {

      // emotes are ignored by most states, but in the case of sneaking,
      // it reveals the player in the room.
      socket.character.removeState(characterStates.SNEAKING);

      return emoteHandler.actionDispatcher(socket.character, action, username)
        .then(response => socketUtil.sendMessages(socket, response))
        .catch(response => socket.character.output(response));
    }
  }


  // when a command is not found, it defaults to "say"
  socket.character.action({actionName: defaultCommand.name, actionParams: [input]});
}

export default {
  commands,
  processDispatch,
  loadCommands,
  setDefaultCommand,
};