
import actionCategories from '../../core/actionCategories';

import createAreaCommand from './commands/createAreaCommand';
import createDoorCommand from './commands/createDoorCommand';
import createRoomCommand from './commands/createRoomCommand';
import createCommand from './commands/createCommand';
import setCommand from './commands/setCommand';
import spawnerCommand from './commands/spawnerCommand';

import createAreaAction from './actions/createAreaAction';
import createDoorAction from './actions/createDoorAction';
import createRoomAction from './actions/createRoomAction';
import setAction from './actions/setAction';
import spawnerAction from './actions/spawnerAction';

export const commands = [
  createAreaCommand,
  createDoorCommand,
  createRoomCommand,
  createCommand,
  setCommand,
  spawnerCommand,
];

export const actions = [
  createAreaAction,
  createDoorAction,
  createRoomAction,
  setAction,
  spawnerAction,
];

actions.forEach(a => a.category = actionCategories.world);
commands.forEach(a => a.category = actionCategories.world);

export default {
  commands,
  actions,
};