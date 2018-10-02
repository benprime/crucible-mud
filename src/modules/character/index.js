import expCommand from './commands/expCommand';
import healthCommand from './commands/healthCommand';
import inventoryCommand from './commands/inventoryCommand';
import keysCommand from './commands/keysCommand';
import statsCommand from './commands/statsCommand';

import expAction from './actions/expAction';
import healthAction from './actions/healthAction';
import inventoryAction from './actions/inventoryAction';
import keysAction from './actions/keysAction';
import statsAction from './actions/statsAction';

import actionCategories from '../../core/actionCategories';

export const commands = [
  expCommand,
  healthCommand,
  inventoryCommand,
  keysCommand,
  statsCommand,
];

export const actions = [
  expAction,
  healthAction,
  inventoryAction,
  keysAction,
  statsAction,
];

actions.forEach(a => a.category = actionCategories.character);
commands.forEach(a => a.category = actionCategories.character);

export default {
  commands,
  actions,
};