import sneakCommand from './commands/sneakCommand';
import sneakAction from './actions/sneakAction';
import actionCategories from '../../core/actionCategories';

export const commands = [
  sneakCommand,
];

export const actions = [
  sneakAction,
];

actions.forEach(a => a.category = actionCategories.stealth);
commands.forEach(a => a.category = actionCategories.stealth);

export default {
  commands,
  actions,
};