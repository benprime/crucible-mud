
import actionCategories from '../../core/actionCategories';

import createAreaCommand from './commands/createAreaCommand';
import createCommand from './commands/createCommand';
import createDoorCommand from './commands/createDoorCommand';
import setCommand from './commands/setCommand';
import spawnerCommand from './commands/spawnerCommand';

import createAreaAction from './actions/createAreaAction';
import createDoorAction from './actions/createDoorAction';
import setAction from './actions/setAction';
import spawnerAction from './actions/spawnerAction';

export const commands = [
  createAreaCommand,
  createCommand,
  createDoorCommand,
  setCommand,
  spawnerCommand,
];

export const actions = [
  createAreaAction,
  createDoorAction,
  setAction,
  spawnerAction,
];

actions.forEach(a => a.category = actionCategories.world);
commands.forEach(a => a.category = actionCategories.world);

export default {
  commands,
  actions,
};