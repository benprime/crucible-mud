import aidCommand from './commands/aidCommand';
import attackCommand from './commands/attackCommand';
import breakCommand from './commands/breakCommand';
import dragCommand from './commands/dragCommand';

import aidAction from './actions/aidAction';
import attackAction from './actions/attackAction';
import breakAction from './actions/breakAction';
import dragAction from './actions/dragAction';

export const commands = [
  aidCommand,
  attackCommand,
  breakCommand,
  dragCommand,
];

export const actions = [
  aidAction,
  attackAction,
  breakAction,
  dragAction,
];

export default {
  commands,
  actions,
};