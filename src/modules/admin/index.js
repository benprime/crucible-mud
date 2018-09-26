import destroyCommand from './commands/destroyCommand';
import puppetCommand from './commands/puppetCommand';
import spawnCommand from './commands/spawnCommand';
import summonCommand from './commands/summonCommand';
import teleportCommand from './commands/teleportCommand';

import destroyAction from './actions/destroyAction';
import puppetAction from './actions/puppetAction';
import spawnAction from './actions/spawnAction';
import summonAction from './actions/summonAction';
import teleportAction from './actions/teleportAction';

export const commands = [
  destroyCommand,
  puppetCommand,
  spawnCommand,
  summonCommand,
  teleportCommand,
];

export const actions = [
  destroyAction,
  puppetAction,
  spawnAction,
  summonAction,
  teleportAction,
];

export default {
  commands,
  actions,
};