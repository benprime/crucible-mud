import { commandCategories } from '../core/commandManager';



export const stateMode = Object.freeze({
  RESTRICT: 'restrict',
  DEACTIVATE: 'deactivate',
});

export default {
  dragging: {
    name: 'DRAGGING', // HUD display
    commandCategories: [
      commandCategories.system,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
  },
  incapacitated: {
    name: 'INCAPACITATED', // HUD display
    commandCategories: [
      commandCategories.system,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="firebrick">You are incompacitated!</span>\n',
  },
  resting: {
    name: 'RESTING', // HUD display
    commandCategories: [
      commandCategories.system,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.DEACTIVATE,
    message: '',
  },
  sneaking: {
    name: 'SNEAKING', // HUD display
    commandCategories: [
      commandCategories.system,
      commandCategories.character,
    ],
    mode: stateMode.DEACTIVATE,
    //message: '<span color="yellow">You are revealed!</span>',
  },
};
