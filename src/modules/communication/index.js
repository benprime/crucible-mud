import actionCategories from '../../core/actionCategories';

import sayCommand from './commands/sayCommand';
import yellCommand from './commands/yellCommand';

import sayAction from './actions/sayAction';
import yellAction from './actions/yellAction';

export const commands = [
  sayCommand,
  yellCommand,
];

export const actions = [
  sayAction,
  yellAction,
];

actions.forEach(a => a.category = actionCategories.communication);
commands.forEach(a => a.category = actionCategories.communication);

export default {
  commands,
  actions,
};