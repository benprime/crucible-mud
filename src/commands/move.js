import lookCommand from './look';
import { commandCategories } from '../core/commandManager';

const commands = [
  /^go\s+(\w+)$/i,
  /^walk\s+(\w+)$/i,
  /^move\s+(\w+)$/i,
];

const directions = [
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
];

export default {
  name: 'move',
  desc: 'move from room to room',
  category: commandCategories.basic,

  patterns: commands.concat(directions),

  dispatch(socket, match) {
    // anytime you move on your own, you are leaving a party
    socket.character.leader = null;

    // Multiple in the array means this matched to a command and not a direction
    let direction = match.length > 1 ? match[1] : match[0];
    this.execute(socket.character, direction).then(() => {
      // todo: I don't think we want to have commands call other commands...
      return lookCommand.execute(socket.character).then(output => socket.emit('output', { message: output }));
    }).catch(output => socket.character.output(output));
  },

  execute(character, dir) {
    return character.move(dir);
  },

  help(socket) {
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
    socket.emit('output', { message: output });
  },
};
