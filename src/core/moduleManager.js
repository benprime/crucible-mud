import config from '../config';
import commandHandler from './commandHandler';
import actionHandler from './actionHandler';

const modules = [];

function loadModule(moduleName) {
  let module = require(`../modules/${moduleName}`).default;
  commandHandler.loadCommands(module.commands);
  actionHandler.loadActions(module.actions);
  modules[module.name] = module;
}

function loadModules() {
  // load all modules
  for (let moduleName of config.modules) {
    loadModule(moduleName);
  }
  commandHandler.setDefaultCommand(config.defaultCommand);
}

export default {
  loadModules,
};