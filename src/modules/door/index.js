import closeCommand from './commands/closeCommand';
import lockCommand from './commands/lockCommand';
import openCommand from './commands/openCommand';
import unlockCommand from './commands/unlockCommand';

import closeAction from './actions/closeAction';
import lockAction from './actions/lockAction';
import openAction from './actions/openAction';
import unlockAction from './actions/unlockAction';

export const commands = [
  closeCommand,
  lockCommand,
  openCommand,
  unlockCommand,
];

export const actions = [
  closeAction,
  lockAction,
  openAction,
  unlockAction,
];

export default {
  commands,
  actions,
};