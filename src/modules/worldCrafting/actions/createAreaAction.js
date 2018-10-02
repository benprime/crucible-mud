import Area from '../../../models/area';

export default {
  name: 'create area',
  execute(character, param) {
    let area = Area.getByName(param);
    if (area) {
      character.output(`Area already exists: ${area.id}`);
      return false;
    }
    Area.addArea(param);
    character.output('Area created.');
    return true;
  },
};
