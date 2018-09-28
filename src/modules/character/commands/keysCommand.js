import commandCategories from '../../../core/commandCategories';

export default {
  name: 'keys',
  desc: 'list the keys your are currently carrying',
  category: commandCategories.character,
  
  patterns: [
    /^keys$/i,
  ],

  parseParams(match) {
    if(match.length > 1) return false;
    return [this.name];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">keys </span><span class="purple">-</span> Display keys on your key ring.<br />';
    character.output(output);
  },
};
