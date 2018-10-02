import closeCommand from './commands/closeCommand';
import lockCommand from './commands/lockCommand';
import openCommand from './commands/openCommand';
import unlockCommand from './commands/unlockCommand';

import closeAction from './actions/closeAction';
import lockAction from './actions/lockAction';
import openAction from './actions/openAction';
import unlockAction from './actions/unlockAction';

import actionCategories from '../../core/actionCategories';


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

actions.forEach(a => a.category = actionCategories.door);
commands.forEach(a => a.category = actionCategories.door);

export default {
  commands,
  actions,
};