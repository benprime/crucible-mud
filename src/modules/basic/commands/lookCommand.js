import commandCategories from '../../../core/commandCategories';
import { getDirection } from '../../../core/directions';
import autocomplete from '../../../core/autocomplete';

export default {
  name: 'look',
  desc: 'look around you or examine an item, mob, or player',
  category: commandCategories.basic,

  patterns: [
    /^$/,
    /^l$/i,
    /^look$/i,
    /^look\s+(.+)$/i,
    /^read\s+(.+)$/i,
    /^l\s+(.+)$/i,
  ],

  parseParams(match, character) {
    let lookTarget = null;
    const short = (match[0] === '');
    if (match.length > 1) {
      lookTarget = match[1];

      // look called on self
      if (lookTarget === 'me' || lookTarget === 'self') {
        lookTarget = character;
      } else {
        const acResult = autocomplete.multiple(character, ['inventory', 'room', 'mob', 'character'], lookTarget);
        if (acResult) {
          lookTarget = acResult.item;
        } else {
          const dir = getDirection(lookTarget);
          if (dir) lookTarget = dir;
        }
      }
    }

    return [this.name, short, lookTarget];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';
    character.output(output);
  },

};
