import Area from '../../../models/area';

export default {
  name: 'create area',
  execute(character, param) {
    let area = Area.getByName(param);
    if (area) {
      character.output(`Area already assigned: ${area.id}`);
      return false;
    }
    Area.addArea(param);
    character.output('Area assigned.');
    return true;
  },
};
