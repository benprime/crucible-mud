import actionCategories from './actionCategories';
import Room from '../models/room';
import socketUtil from '../core/socketUtil';
import config from '../config';

export const stateMode = Object.freeze({
  /**
   * Commands not in actionCategories are prevented.
   */
  RESTRICT: 'restrict',
  /**
   * Any commands not in actionCategories deactivate this state.
   */
  DEACTIVATE: 'deactivate',
  /**
  * Updates only.
  */
  NONE: 'none',
});

export default {
  DRAGGING: {
    name: 'DRAGGING',
    actionCategories: [
      actionCategories.admin,
      actionCategories.basic,
      actionCategories.core,
      actionCategories.character,
      actionCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="yellow">You cannot do that while dragging a player!</span>\n<span class="silver">type DROP <PLAYER NAME> to stop dragging them.</span>\n',
    update: function(character) {
      const draggedPlayer = socketUtil.getCharacterById(character.dragging);
      if (!draggedPlayer.hasState(exports.default.INCAPACITATED)) {
        character.dragging = null;
      }
    },
  },
  INCAPACITATED: {
    name: 'INCAPACITATED',
    actionCategories: [
      actionCategories.admin,
      actionCategories.core,
      actionCategories.basic,
      actionCategories.character,
      actionCategories.communication,
    ],
    mode: stateMode.RESTRICT,
    message: '<span class="firebrick">You are incapacitated!</span>\n',
    update: function(character) {
      if (character.currentHP > 0) {
        character.removeState(exports.default.INCAPACITATED);
      }
    },
  },
  RESTING: {
    name: 'RESTING',
    actionCategories: [
      actionCategories.admin,
      actionCategories.core,
      actionCategories.character,
      actionCategories.communication,
    ],
    mode: stateMode.DEACTIVATE,
    update: function(character) {
      const room = Room.getById(character.roomId);
      if (room.mobs.length > 0) {
        character.removeState(exports.default.RESTING);
        character.output('You cannot rest with enemies in the room!');
        character.save();
        return;
      }

      if (character.currentHP === character.maxHP) {
        character.removeState(exports.default.RESTING);
        character.output('<span class="olive">You are fully healed.</span>');
        character.save();
        return;
      }
    },
    endOfRound: function(character, round) {
      if (round % config.REGEN_ROUNDS === 0) {
        character.regen();
        character.save();
      }
    },
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
  BLEEDING: {
    name: 'BLEEDING',
    mode: stateMode.NONE,
    endOfRound: function(character, round) {
      if (round % config.BLEED_ROUNDS === 0) {
        character.output('<span class="firebrick">You are bleeding!</span>');
        character.toRoom(`<span class="firebrick">${character.name} is bleeding out!</span>`);
        character.takeDamage(1);
        character.save();
      }
    },
  },
};
