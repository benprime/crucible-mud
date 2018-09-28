import lookCommand from './commands/lookCommand';
import moveCommand from './commands/moveCommand';
import lookAction from './actions/lookAction';
import moveAction from './actions/moveAction';

export const commands = [
  lookCommand,
  moveCommand,
];

export const actions = [
  lookAction,
  moveAction,
];

export default {
  commands,
  actions,
};