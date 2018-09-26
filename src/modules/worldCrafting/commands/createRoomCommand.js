import commandCategories from '../../../core/commandCategories';

export default {
  name: 'create room',
  desc: 'creates an adjacent room',
  category: commandCategories.world,
  admin: true,

  patterns: [
    /^create\s+room\s+(\w+)$/i,
  ],

  parseParams(match) {
    return [this.name, match[1]];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
