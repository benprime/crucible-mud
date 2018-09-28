import commandCategories from '../../../core/commandCategories';

export default {
  name: 'search',
  desc: 'search the current room for hidden objects',
  category: commandCategories.item,

  patterns: [
    /^search$/i,
  ],

  parseParams() {
    return [this.name];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">search</span><span class="purple">-</span> If successful, reveal any hidden items and/or exits.<br />';
    character.output(output);
  },

};
