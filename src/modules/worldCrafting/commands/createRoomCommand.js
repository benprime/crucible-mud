import { getDirection } from '../../../core/directions';

export default {
  name: 'create room',
  desc: 'creates an adjacent room',

  admin: true,

  patterns: [
    /^create\s+room\s+(\w+)$/i,
  ],

  parseParams(match) {
    const dir = getDirection(match[1]);
    return [this.name, dir];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
