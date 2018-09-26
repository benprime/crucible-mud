import commandCategories from '../../../core/commandCategories';

export default {
  name: 'create area',
  desc: 'creates a map area',
  category: commandCategories.world,
  admin: true,

  patterns: [
    /^create\s+area\s+(.+)$/i,
    /^create\s+area$/i,
  ],

  parseParams(match) {
    if(match.length != 2) return false;
    return [this.name, match[1]];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create area </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
