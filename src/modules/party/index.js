import followCommand from './commands/followCommand';
import inviteCommand from './commands/inviteCommand';
import partyCommand from './commands/partyCommand';
import uninviteCommand from './commands/uninviteCommand';

import followAction from './actions/followAction';
import inviteAction from './actions/inviteAction';
import partyAction from './actions/partyAction';
import uninviteAction from './actions/uninviteAction';

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

export default {
  commands,
  actions,
};