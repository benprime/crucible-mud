import restCommand from './commands/restCommand';
import trackCommand from './commands/trackCommand';

import restAction from './actions/restAction';
import trackAction from './actions/trackAction';

import actionCategories from '../../core/actionCategories';

export const commands = [
  restCommand,
  trackCommand,
];

export const actions = [
  restAction,
  trackAction,
];

actions.forEach(a => a.category = actionCategories.special);
commands.forEach(a => a.category = actionCategories.special);

export default {
  commands,
  actions,
};