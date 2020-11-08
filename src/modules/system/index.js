import actionCategories from '../../core/actionCategories';

import catalogCommand from './commands/catalogCommand';
import gossipCommand from './commands/gossipCommand';
import helpCommand from './commands/helpCommand';
import logoutCommand from './commands/logoutCommand';
import rollCommand from './commands/rollCommand';
import telepathyCommand from './commands/telepathyCommand';
import whoCommand from './commands/whoCommand';


export const commands = [
  catalogCommand,
  gossipCommand,
  helpCommand,
  logoutCommand,
  rollCommand,
  telepathyCommand,
  whoCommand,
];

import catalogAction from './actions/catalogAction';
import gossipAction from './actions/gossipAction';
import helpAction from './actions/helpAction';
import logoutAction from './actions/logoutAction';
import rollAction from './actions/rollAction';
import telepathyAction from './actions/telepathyAction';
import whoAction from './actions/whoAction';

export const actions = [
  catalogAction,
  gossipAction,
  helpAction,
  logoutAction,
  rollAction,
  telepathyAction,
  whoAction,
];

actions.forEach(a => a.category = actionCategories.core);
commands.forEach(a => a.category = actionCategories.core);

export default {
  commands,
  actions,
};