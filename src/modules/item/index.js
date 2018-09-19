import acceptCommand from './commands/acceptCommand';
import dropCommand from './commands/dropCommand';
import equipCommand from './commands/equipCommand';
import hideCommand from './commands/hideCommand';
import kickCommand from './commands/kickCommand';
import offerCommand from './commands/offerCommand';
import searchCommand from './commands/searchCommand';
import takeCommand from './commands/takeCommand';
import unequipCommand from './commands/unequipCommand';

import acceptAction from './actions/acceptAction';
import dropAction from './actions/dropAction';
import equipAction from './actions/equipAction';
import hideAction from './actions/hideAction';
import kickAction from './actions/kickAction';
import offerAction from './actions/offerAction';
import searchAction from './actions/searchAction';
import takeAction from './actions/takeAction';
import unequipAction from './actions/unequipAction';

export const commands = [
  acceptCommand,
  dropCommand,
  equipCommand,
  hideCommand,
  kickCommand,
  offerCommand,
  searchCommand,
  takeCommand,
  unequipCommand,
];

export const actions = [
  acceptAction,
  dropAction,
  equipAction,
  hideAction,
  kickAction,
  offerAction,
  searchAction,
  takeAction,
  unequipAction,
];

export default {
  commands,
  actions,
};