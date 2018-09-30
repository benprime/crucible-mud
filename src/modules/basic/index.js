import lookCommand from './commands/lookCommand';
import moveCommand from './commands/moveCommand';
import lookAction from './actions/lookAction';
import moveAction from './actions/moveAction';
import actionCategories from '../../core/actionCategories';

export const commands = [
  lookCommand,
  moveCommand,
];

export const actions = [
  lookAction,
  moveAction,
];

actions.forEach(a => a.category = actionCategories.basic);
commands.forEach(a => a.category = actionCategories.basic);

export default {
  commands,
  actions,
};