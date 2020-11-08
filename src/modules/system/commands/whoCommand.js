
import whoAction from '../actions/whoAction';

export default {
  name: 'who',
  desc: 'display the other players currently online',

  action: whoAction.name,

  patterns: [
    /^who$/i,
  ],

  parseParams() {
    return {actionName: this.name, actionParams: []};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">who</span> <span class="purple">-</span> Display list of all connected players.<br />';
    character.output(output);
  },
};
