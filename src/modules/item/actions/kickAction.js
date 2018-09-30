import Room from '../../../models/room';
import { indefiniteArticle } from '../../../core/language';

export default {
  name: 'kick',
  execute(character, item, dir) {

    if (!item) {
      character.output('You don\'t see that item here');
      return;
    }

    if (!dir) {
      character.output('Invalid direction.');
      return;
    }

    const room = Room.getById(character.roomId);
    
    const exit = this.getExit(dir);
    if (!exit) {
      character.output('There is no exit in that direction!');
    }

    const targetRoom = this.constructor.getById(exit.roomId);
    this.inventory.id(item.id).remove();
    this.save(err => { if (err) throw err; });
    targetRoom.inventory.push(item);
    targetRoom.save(err => { if (err) throw err; });
  
    // for scripting
    this.tracks[item.id] = {
      dir: dir,
      timestamp: new Date().getTime(),
    };
  
    const dirName = dir.long;
    const msg = `<span class="yellow">${character.name} kicks the ${item.name} to the ${dirName}</span>`;
    room.output(msg);
  
    const targetDirName = dir.opposite.long;
  
    // language, determining A or An
    let article = indefiniteArticle(item.name);
    article = article.replace(/^\w/, c => c.toUpperCase());
  
    const targetMsg = `<span class="yellow">${article} ${item.name} enters from the ${targetDirName}.</yellow>`;
    room.output(targetMsg);
  },
};

