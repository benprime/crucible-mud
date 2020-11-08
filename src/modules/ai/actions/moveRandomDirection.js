import autocomplete from '../../../core/autocomplete';
import getById from '../../../models/room';

/**
 * Picks the first object of item type in the room and saves it in aiState.
 */
export default {
  name: 'targetObject',
  execute(character) {
    const room = getById(character.roomId);
  },
};