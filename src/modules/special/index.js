import restCommand from './commands/restCommand';
import trackCommand from './commands/trackCommand';

import restAction from './actions/restAction';
import trackAction from './actions/trackAction';

export const commands = [
  restCommand,
  trackCommand,
];

export const actions = [
  restAction,
  trackAction,
];

export default {
  commands,
  actions,
};