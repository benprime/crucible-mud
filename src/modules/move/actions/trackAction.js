import autocomplete from '../../../core/autocomplete';
import { getDirection } from '../../../core/directions';

export default {
  name: 'track',
  execute(character, name) {

    const target = autocomplete.character(character, name);
    if (!target) {
      character.output('Unknown player.');
      return false;
    }

    let tracks = this.tracks[target.id];
    let output;
    if (tracks) {
      const dir = getDirection(tracks.dir);

      const now = new Date().getTime();
      const rawSeconds = Math.floor((now - tracks.timestamp) / 1000);
      const minutes = Math.floor(rawSeconds / 60);
      const seconds = Math.floor(rawSeconds % 60);
      let displayString;
      if (minutes > 1) {
        displayString = `${minutes} minutes ago`;
      } else if (minutes == 1) {
        displayString = 'a minute ago';
      } else if (seconds > 1) {
        displayString = `${seconds} seconds ago`;
      } else {
        displayString = 'a second ago';
      }

      output = `<span class="yellow">${target.name} last left to the ${dir.long} ${displayString}.</span>`;
    } else {
      output = `${target.name} has not passed through here recently.`;
    }
    character.output(output);
  },
};
