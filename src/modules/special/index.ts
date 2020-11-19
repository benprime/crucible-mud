import restCommand from './commands/restCommand';
import restAction from './actions/restAction';
import actionCategories from '../../core/actionCategories';

export const commands = [
  restCommand,
];

export const actions = [
  restAction,
];

actions.forEach(a => a.category = actionCategories.special);
commands.forEach(a => a.category = actionCategories.special);

export default {
  commands,
  actions,
};