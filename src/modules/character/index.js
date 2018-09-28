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

export default {
  commands,
  actions,
};