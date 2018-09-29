import commandCategories from '../../../core/commandCategories';
import whoAction from '../actions/whoAction';

export default {
  name: 'who',
  desc: 'display the other players currently online',
  category: commandCategories.core,
  action: whoAction.name,

  patterns: [
    /^who$/i,
  ],

  parseParams() {
    return [this.name];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">who</span> <span class="purple">-</span> Display list of all connected players.<br />';
    character.output(output);
  },
};
