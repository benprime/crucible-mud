

export default {
  name: 'catalog',
  desc: 'list catalog of item types for use with spawn command',

  admin: true,

  patterns: [
    /^catalog (mobs)$/i,
    /^cat (mobs)$/i,
    /^catalog (items)$/i,
    /^cat (items)$/i,
    /^catalog (keys)$/i,
    /^cat (keys)$/i,
    /^catalog (areas)$/i,
    /^cat (areas)$/i,
    /^catalog$/i,
    /^catalog\s.*$/i,
    /^cat$/i,
  ],

  parseParams(match) {
    if (match.length != 2) return;
    return {actionName: this.name, actionParams: [match[1]]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">[catalog|cat] mobs </span><span class="purple">-</span> Display info table of all valid mobs<br />';
    output += '<span class="mediumOrchid">[catalog|cat] items </span><span class="purple">-</span> Display info table of all valid items<br />';
    output += '<span class="mediumOrchid">[catalog|cat] keys </span><span class="purple">-</span> Display info table of all valid keys<br />';
    output += '<span class="mediumOrchid">[catalog|cat] areas </span><span class="purple">-</span> Display info table of all valid areas<br />';
    character.output(output);
  },
};
