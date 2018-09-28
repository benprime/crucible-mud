import commandCategories from '../../../core/commandCategories';

export default {
  name: 'list',
  desc: 'list item available for purchase in a shop',
  category: commandCategories.shop,

  patterns: [
    /^list$/i,
    /^ls$/i,
  ],

  parseParams() {
    return [this.name];
  },

  help(character) {
    const output = '<span class="mediumOrchid">list </span><span class="purple">-</span> List store inventory.<br />';
    character.output(output);
  },
};
