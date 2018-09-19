// command modules
// export { default as catalogCommand } from './commands/catalog';
// export { default as gossipCommand } from './commands/gossip';
// export { default as help } from './commands/help';
// export { default as roll } from './commands/roll';
// export { default as telepathy } from './commands/telepathy';
// export { default as who } from './commands/who';

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