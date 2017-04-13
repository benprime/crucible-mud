'use strict';

const actionData = require('../data/actionData');

module.exports = {
  name: 'help',

  patterns: [
    /^help$/i,
    /^h$/i,
    /^\?$/
  ],

  dispatch(socket, match) {
    module.exports.execute(socket);
  },

  execute(socket) {
    let output = '';
    output += '<span class="cyan">Movement:</span><br>';
    output += '<span class="mediumOrchid">n<span class="purple"> | </span>north</span> <span class="purple">-</span> Move north.<br />';
    output += '<span class="mediumOrchid">s<span class="purple"> | </span>south</span> <span class="purple">-</span> Move south.<br />';
    output += '<span class="mediumOrchid">e<span class="purple"> | </span>east</span> <span class="purple">-</span> Move east.<br />';
    output += '<span class="mediumOrchid">w<span class="purple"> | </span>west</span> <span class="purple">-</span> Move west.<br />';
    output += '<span class="mediumOrchid">ne<span class="purple"> | </span>northeast</span> <span class="purple">-</span> Move northeast.<br />';
    output += '<span class="mediumOrchid">se<span class="purple"> | </span>southeast</span> <span class="purple">-</span> Move southeast.<br />';
    output += '<span class="mediumOrchid">nw<span class="purple"> | </span>northwest</span> <span class="purple">-</span> Move northwest.<br />';
    output += '<span class="mediumOrchid">sw<span class="purple"> | </span>southwest</span> <span class="purple">-</span> Move southwest.<br />';
    output += '<span class="mediumOrchid">u<span class="purple"> | </span>up</span> <span class="purple">-</span> Move up.<br />';
    output += '<span class="mediumOrchid">d<span class="purple"> | </span>down</span> <span class="purple">-</span> Move down.<br /><br />';

    output += '<span class="cyan">Commands:</span><br>';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look</span> <span class="purple">-</span> Look at current room.<br />';
    output += '<span class="mediumOrchid">who</span> <span class="purple">-</span> List all online players.<br /><br>';

    output += '<span class="cyan">Combat:</span><br>';
    output += '<span class="mediumOrchid">attack <span class="purple">|</span> a</span> <span class="purple">-</span> attack &lt;target&gt;<br />';
    output += '<span class="mediumOrchid">break <span class="purple">|</span> br</span> <span class="purple">-</span> Break off current attack.<br /><br>';

    output += '<span class="cyan">Communication:</span><br>';
    output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Start command with . to speak to users in current room.<br />';
    output += '<span class="mediumOrchid">"<message></span> <span class="purple">-</span> Yell to this room and all adjacent rooms.<br />';
    output += '<span class="mediumOrchid">/&lt;username&gt; <message></span> <span class="purple">-</span> Send message directly to a single player.<br />';
    output += '<span class="mediumOrchid">gossip &lt;message&gt;</span> <span class="purple">-</span> Send messages to all connected players.<br />';

    output += '<br><span class="cyan">Actions:</span><br />';
    output += `<span class="silver">${Object.keys(actionData.actions).sort().join('<span class="mediumOrchid">, </span>')}</span><br /></br />`;

    if (socket.user.admin) {
      output += '<span class="cyan">Admin commands:</span><br />';
      output += '<span class="mediumOrchid">create room &lt;dir&gt;</span><br />';
      output += '<span class="mediumOrchid">set room name &lt;new room name&gt;</span><br />';
      output += '<span class="mediumOrchid">set room desc &lt;new room desc&gt;</span><br />';
      output += '<span class="mediumOrchid">create item &lt;item name&gt;</span><br />';
      output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><br />';
      output += '<span class="mediumOrchid">list - list mob catalog</span><br />';
      output += '<span class="mediumOrchid">spawn <mobType> - spawn &lt;mobType&gt;</span><br />';
    }
    socket.emit('output', { message: output });

  },

  help() {

  },
};
