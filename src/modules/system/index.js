import catalogCommand from './commands/catalogCommand';
import gossipCommand from './commands/gossipCommand';
import helpCommand from './commands/helpCommand';
import rollCommand from './commands/rollCommand';
import telepathyCommand from './commands/telepathyCommand';
import whoCommand from './commands/whoCommand';

export const commands = [
  catalogCommand,
  gossipCommand,
  helpCommand,
  rollCommand,
  telepathyCommand,
  whoCommand,
];

import catalogAction from './actions/catalogAction';
import gossipAction from './actions/gossipAction';
import helpAction from './actions/helpAction';
import rollAction from './actions/rollAction';
import telepathyAction from './actions/telepathyAction';
import whoAction from './actions/whoAction';

export const actions = [
  catalogAction,
  gossipAction,
  helpAction,
  rollAction,
  telepathyAction,
  whoAction,
];

export default {
  commands,
  actions,
};