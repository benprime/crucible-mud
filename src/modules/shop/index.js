import buyCommand from './commands/buyCommand';
import listCommand from './commands/listCommand';
import sellCommand from './commands/sellCommand';
import stockCommand from './commands/stockCommand';

import buyAction from './actions/buyAction';
import listAction from './actions/listAction';
import sellAction from './actions/sellAction';
import stockAction from './actions/stockAction';

export const commands = [
  buyCommand,
  listCommand,
  sellCommand,
  stockCommand,
];

export const actions = [
  buyAction,
  listAction,
  sellAction,
  stockAction,
];

export default {
  commands,
  actions,
};