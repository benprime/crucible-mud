import actionCategories from './actionCategories';

export const stateMode = Object.freeze({
  /**
   * Commands not in actionCategories are prevented.
   */
  RESTRICT: 'restrict',

  /**
   * Any commands not in actionCategories deactivate this state.
   */
  DEACTIVATE: 'deactivate',
});

export default {
  DRAGGING: {
    name: 'DRAGGING',
    actionCategories: [
      actionCategories.basic,
      actionCategories.core,
      actionCategories.character,
      actionCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="yellow">You cannot do that while dragging a player!</span>\n<span class="silver">type DROP <PLAYER NAME> to stop dragging them.</span>\n',
  },
  INCAPACITATED: {
    name: 'INCAPACITATED',
    actionCategories: [
      actionCategories.core,
      actionCategories.character,
      actionCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="firebrick">You are incapacitated!</span>\n',
  },
  RESTING: {
    name: 'RESTING',
    actionCategories: [
      actionCategories.core,
      actionCategories.character,
      actionCategories.communication,
    ],
    mode: stateMode.DEACTIVATE,
  },
  SNEAKING: {
    name: 'SNEAKING',
    actionCategories: [
      actionCategories.basic,
      actionCategories.core,
      actionCategories.character,
    ],
    mode: stateMode.DEACTIVATE,
    message: '<span class="yellow">You are revealed!</span>',
  },
  ENCUMBERED: {
    name: 'ENCUMBERED',
    actionCategories: [
      actionCategories.basic,
      actionCategories.core,
      actionCategories.character,
      actionCategories.communication,
    ],
    mode: stateMode.RESTRICT,
  },
  POISONED: {
    name: 'POISONED',
    actionCategories: [
      actionCategories.basic,
      actionCategories.core,
      actionCategories.character,
      actionCategories.communication,
    ],
    mode: stateMode.RESTRICT,
  },
};
