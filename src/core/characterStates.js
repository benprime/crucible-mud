import commandCategories from './commandCategories';

export const stateMode = Object.freeze({
  RESTRICT: 'restrict',
  DEACTIVATE: 'deactivate',
});

export default {
  DRAGGING: {
    name: 'DRAGGING',
    commandCategories: [
      commandCategories.basic,
      commandCategories.core,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="yellow">You cannot do that while dragging a player!</span>\n<span class="silver">type DROP <PLAYER NAME> to stop dragging them.</span>\n',
  },
  INCAPACITATED: {
    name: 'INCAPACITATED',
    commandCategories: [
      commandCategories.core,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="firebrick">You are incapacitated!</span>\n',
  },
  RESTING: {
    name: 'RESTING',
    commandCategories: [
      commandCategories.core,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.DEACTIVATE,
  },
  SNEAKING: {
    name: 'SNEAKING',
    commandCategories: [
      commandCategories.basic,
      commandCategories.core,
      commandCategories.character,
    ],
    mode: stateMode.DEACTIVATE,
    message: '<span class="yellow">You are revealed!</span>',
  },
  ENCUMBERED: {
    name: 'ENCUMBERED',
    commandCategories: [
      commandCategories.basic,
      commandCategories.core,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
  },
  POISONED: {
    name: 'POISONED',
    commandCategories: [
      commandCategories.basic,
      commandCategories.core,
      commandCategories.character,
      commandCategories.communication,
    ],
    mode: stateMode.RESTRICT,
  },
};
