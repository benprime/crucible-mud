import moveCommand from './commands/moveCommand';
import trackCommand from './commands/trackCommand';
import moveAction from './actions/moveAction';
import trackAction from './actions/trackAction';
import actionCategories from '../../core/actionCategories';

export const commands = [
  moveCommand,
  trackCommand,
];

export const actions = [
  moveAction,
  trackAction,
];

actions.forEach(a => a.category = actionCategories.move);
commands.forEach(a => a.category = actionCategories.move);

export default {
  commands,
  actions,
};