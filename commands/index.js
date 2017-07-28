'use strict';

const actionHandler = require('../actionHandler');
const helpHandler = require('./help');

let handlers = [];
//todo: perhaps this should live in a config file?
let defaultCommand;


//const allowedTargets = ['none', 'mob', 'item', 'room', 'player'];
const normalizedPath = require('path').join(__dirname);

console.log('path:', normalizedPath);

function validateCommand(commandHandler, file) {
  if (!commandHandler.name) throw `command ${file} missing name!`;
  if (!commandHandler.dispatch) throw `command ${file} missing dispatch!`;
  if (!commandHandler.execute) throw `command ${file} missing execute!`;
  if (!commandHandler.patterns) throw `command ${file} missing patterns!`;
  if (!commandHandler.help) throw `command ${file} missing help!`;

  /*
    if(Array.isArray(commandHandler.targets) && commandHandler.length > 0) {
      
    }
    */

}

require('fs').readdirSync(normalizedPath).forEach(function (file) {
  if (file != 'index.js') {
    
    // Turning off no-dynamic-require rule for our command loader.
    // eslint-disable-next-line
    let commandHandler = require('./' + file);

    validateCommand(commandHandler, file);

    handlers.push(commandHandler);
    helpHandler.registerCommand(commandHandler);
  }

  defaultCommand = handlers.find(h => h.name === 'say');
});

function processDispatch(socket, input) {
  input = input.trim();

  // check if input string matches any of our matching patterns.
  // then call the handler with the input, socket
  for (let h = 0; h < handlers.length; h++) {
    for (let p = 0; p < handlers[h].patterns.length; p++) {
      let match = input.match(handlers[h].patterns[p]);
      if (match) {
        if (!handlers[h].admin || socket.user.admin) {
          handlers[h].dispatch(socket, match);
          return;
        }
      }
    }
  }

  // handle player actions (emotes)
  const actionRegex = /^(\w+)\s?(.*)$/i;
  let match = input.match(actionRegex);
  if (match) {
    let action = match[1];
    let username = match[2];
    var actionFound = actionHandler.actionDispatcher(socket, action, username);
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
      console.log(e);
      socket.emit('output', { message: `AN ERROR OCCURED!\n${e.message}` });
    }
  },
};
