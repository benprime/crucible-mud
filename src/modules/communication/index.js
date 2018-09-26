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

export default {
  commands,
  actions,
};