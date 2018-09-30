import followCommand from './commands/followCommand';
import inviteCommand from './commands/inviteCommand';
import partyCommand from './commands/partyCommand';
import uninviteCommand from './commands/uninviteCommand';

import followAction from './actions/followAction';
import inviteAction from './actions/inviteAction';
import partyAction from './actions/partyAction';
import uninviteAction from './actions/uninviteAction';

import actionCategories from '../../core/actionCategories';

export const commands = [
  followCommand,
  inviteCommand,
  partyCommand,
  uninviteCommand,
];

export const actions = [
  followAction,
  inviteAction,
  partyAction,
  uninviteAction,
];

actions.forEach(a => a.category = actionCategories.party);
commands.forEach(a => a.category = actionCategories.party);

export default {
  commands,
  actions,
};