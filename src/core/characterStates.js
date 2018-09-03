import commandCategories from './commandCategories';

export const stateMode = Object.freeze({
  RESTRICT: 'restrict',
  DEACTIVATE: 'deactivate',
});

export default {
  DRAGGING: {
    name: 'DRAGGING', // HUD display
    commandCategories: [
      commandCategories.basic,
      commandCategories.system,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="yellow">You cannot do that while dragging a player!</span>\n<span class="silver">type DROP <PLAYER NAME> to stop dragging them.</span>\n',
  },
  INCAPACITATED: {
    name: 'INCAPACITATED', // HUD display
    commandCategories: [
      commandCategories.system,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="firebrick">You are incompacitated!</span>\n',
  },
  RESTING: {
    name: 'RESTING', // HUD display
    commandCategories: [
      commandCategories.system,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.DEACTIVATE,
    message: '',
  },
  SNEAKING: {
    name: 'SNEAKING', // HUD display
    commandCategories: [
      commandCategories.basic,
      commandCategories.system,
      commandCategories.character,
    ],
    mode: stateMode.DEACTIVATE,
    message: '<span class="yellow">You are revealed!</span>',
  },
  ENCUMBERED: {
    name: 'ENCUMBERED', // HUD display
    commandCategories: [
      commandCategories.basic,
      commandCategories.system,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
  },
};
