import commandCategories from '../../../core/commandCategories';

export default {
  name: 'summon',
  desc: 'teleport another player to your location',
  category: commandCategories.admin,
  admin: true,

  patterns: [
    /^summon\s+(\w+)$/i,
    /^sum\s+(\w+)$/i,
    /^summon$/i,
    /^sum$/i,
  ],

  parseParams(match) {
    if(match.length < 2) false;
    return [this.name, match[1]];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">summon &lt;username&gt; </span><span class="purple">-</span> Summon &lt;player&gt; to current room.<br />';
    character.output(output);
  },
};
