import { getDirection } from '../../../core/directions';

export default {
  name: 'move',
  desc: 'move from room to room',

  patterns: [
    /^go\s+(\w+)$/i,
    /^walk\s+(\w+)$/i,
    /^move\s+(\w+)$/i,
    /^n$/i,
    /^s$/i,
    /^e$/i,
    /^w$/i,
    /^ne$/i,
    /^nw$/i,
    /^se$/i,
    /^sw$/i,
    /^u$/i,
    /^d$/i,
    /^north$/i,
    /^south$/i,
    /^east$/i,
    /^west$/i,
    /^northeast$/i,
    /^northwest$/i,
    /^southeast$/i,
    /^southwest$/i,
    /^up$/i,
    /^down$/i,
  ],

  /**
   * Parses params from and prepares params for calling execute command.
   * @param {Character} character 
   * @param {String[]} match 
   */
  parseParams(match) {
    let dirInput = match.length > 1 ? match[1] : match[0];
    let dir = getDirection(dirInput);
    return {actionName: this.name, actionParams: [dir]};
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">move command </span><span class="darkcyan">-</span> Move in specified direction. Move command word is not used.<br />';
    output += '<span class="mediumOrchid">n<span class="purple"> | </span>north</span> <span class="purple">-</span> Move north.<br />';
    output += '<span class="mediumOrchid">s<span class="purple"> | </span>south</span> <span class="purple">-</span> Move south.<br />';
    output += '<span class="mediumOrchid">e<span class="purple"> | </span>east</span> <span class="purple">-</span> Move east.<br />';
    output += '<span class="mediumOrchid">w<span class="purple"> | </span>west</span> <span class="purple">-</span> Move west.<br />';
    output += '<span class="mediumOrchid">ne<span class="purple"> | </span>northeast</span> <span class="purple">-</span> Move northeast.<br />';
    output += '<span class="mediumOrchid">se<span class="purple"> | </span>southeast</span> <span class="purple">-</span> Move southeast.<br />';
    output += '<span class="mediumOrchid">nw<span class="purple"> | </span>northwest</span> <span class="purple">-</span> Move northwest.<br />';
    output += '<span class="mediumOrchid">sw<span class="purple"> | </span>southwest</span> <span class="purple">-</span> Move southwest.<br />';
    output += '<span class="mediumOrchid">u<span class="purple"> | </span>up</span> <span class="purple">-</span> Move up.<br />';
    output += '<span class="mediumOrchid">d<span class="purple"> | </span>down</span> <span class="purple">-</span> Move down.<br />';
    character.output(output);
  },
};
