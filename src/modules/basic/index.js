import lookCommand from './commands/lookCommand';
import lookAction from './actions/lookAction';
import actionCategories from '../../core/actionCategories';

export const commands = [
  lookCommand,
];

export const actions = [
  lookAction,
];

actions.forEach(a => a.category = actionCategories.basic);
commands.forEach(a => a.category = actionCategories.basic);

export default {
  commands,
  actions,
};