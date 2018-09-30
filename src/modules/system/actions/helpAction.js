import emoteData from '../../../data/emoteData';
import { commands } from '../../../core/commandHandler';
import actionCategories from '../../../core/actionCategories';


function commandListHelp(character) {
  let output = '<span class="mediumOrchid">For specific help on any of these commands: </span><span class="silver">help &lt;command name&gt;</span>\n';

  for (let category of Object.values(actionCategories)) {
    let catOutput = `\n<span class="yellow">${category.name}</span>`;
    if (category.restricted) catOutput += '<span class="firebrick"> [RESTRICTED]</span>';
    catOutput += '\n';
    catOutput += '<span class="olive">===============================================================================</span>\n';

    let categoryCommands = Object.values(commands).filter(c => c.category === category).sort(function (a, b) {
      return a.name - b.name;
    });

    if (categoryCommands.length === 0) continue;

    let catMaxNameLength = Math.max(...categoryCommands.map(c => c.name.length));

    for (let command of Object.values(categoryCommands)) {
      catOutput += `<span class="mediumOrchid" style="white-space:pre">${command.name.padEnd(catMaxNameLength, ' ')}</span><span class="purple"> | </span><span class="silver">${command.desc}</span>\n`;
    }

    output += catOutput;
  }

  character.output(output);
}

function basicHelp(character) {
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
  // output += '<span class="mediumOrchid">open</span><br />';
  // output += '<span class="mediumOrchid">close</span><br />';
  // output += '<span class="mediumOrchid">unlock</span><br /><br>';

  output += '<span class="cyan">Character Info:</span><br>';
  output += '<span class="mediumOrchid">stats</span><br />';
  output += '<span class="mediumOrchid">xp <span class="purple">|</span> exp</span><br />';
  output += '<span class="mediumOrchid">inventory</span> <span class="purple"><br />';
  output += '<span class="mediumOrchid">keys</span> <span class="purple"><br /><br>';

  output += '<span class="cyan">Commands:</span><br>';
  output += '<span class="mediumOrchid">help &lt;command&gt</span> <span class="purple">-</span> Display detailed help for specified command.<br />';
  output += '<span class="mediumOrchid">l <span class="purple">|</span> look</span> <span class="purple"><br />';
  output += '<span class="mediumOrchid">who</span><br />';
  output += '<span class="mediumOrchid">drop &lt;item name&gt;</span> <span class="purple"><br />';
  output += '<span class="mediumOrchid">equip &lt;item name&gt;</span> <span class="purple"><br />';
  output += '<span class="mediumOrchid">hide &lt;exit dir &#x2F; item name&gt;</span><br />';
  output += '<span class="mediumOrchid">roll &lt;die type&gt;</span><br />';
  output += '<span class="mediumOrchid">search</span><br />';
  output += '<span class="mediumOrchid">take &lt;item name&gt;</span> <span class="purple"><br />';
  output += '<span class="mediumOrchid">unequip &lt;item name&gt;</span> <span class="purple"><br /><br>';

  output += '<span class="cyan">Combat:</span><br>';
  output += '<span class="mediumOrchid">attack &lt;mob name&gt; </span><span class="purple">|</span><span class="mediumOrchid"> a</span> <span class="purple">-</span> Begin combat attacking &lt;mob name&gt.<br />';
  output += '<span class="mediumOrchid">break </span><span class="purple">|</span><span><span class="mediumOrchid"> br</span> <span class="purple">-</span> End combat.<br /><br>';

  // if (socket.user.admin) {
  //   output += '<span class="cyan">Admin commands:</span><br />';
  //   output += '<span class="mediumOrchid">create room</span><br />';
  //   output += '<span class="mediumOrchid">set room</span><br />';
  //   output += '<span class="mediumOrchid">teleport</span><br />';
  //   output += '<span class="mediumOrchid">summon</span><br />';
  //   output += '<span class="mediumOrchid">catalog</span><br />';
  //   output += '<span class="mediumOrchid">spawn mob</span><br />';
  //   output += '<span class="mediumOrchid">spawn item</span><br />';
  //   output += '<span class="mediumOrchid">destroy</span><br />';
  //   output += '<span class="mediumOrchid">lock</span><br /><br>';
  //   output += '<span class="mediumOrchid">spawner</span><br /><br>';
  //   output += '<span class="mediumOrchid">stock</span><br /><br>';
  // }

  output += '<span class="cyan">Communication:</span><br>';
  output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Start command with . to speak to users in current room.<br />';
  output += '<span class="mediumOrchid">"<message></span> <span class="purple">-</span> Yell to this room and all adjacent rooms.<br />';
  output += '<span class="mediumOrchid">&#x2F;&lt;username&gt; <message></span> <span class="purple">-</span> Send message directly to a single player.<br />';
  output += '<span class="mediumOrchid">gossip &lt;message&gt;</span> <span class="purple">-</span> Send messages to all connected players.<br />';
  output += '<span class="mediumOrchid">invite &lt;player name&gt;</span><br />';
  output += '<span class="mediumOrchid">offer &lt;player name&gt; &lt;item name&gt;</span><br /><br>';

  output += '<span class="cyan">Emotes:</span><br />';
  output += `<span class="silver">${Object.keys(emoteData.emotes).sort().join('<span class="mediumOrchid">, </span>')}</span><br /></br />`;

  character.output(output);
}

function commandHelp(character, commandName) {
  commandName = commandName.toLowerCase();
  if (Object.keys(commands).includes(commandName)) {
    commands[commandName].help(character);
  }
  else {
    character.output('No help for that topic.');
  }
}

export default {
  name: 'help',
  execute(character, topic) {
    if (topic === 'commands') {
      commandListHelp(character);
    }
    else if (topic) {
      commandHelp(character, topic);
    }
    else {
      basicHelp(character);
    }
    return Promise.resolve();
  },
};
