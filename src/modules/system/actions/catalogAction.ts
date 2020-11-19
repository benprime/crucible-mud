import mobData from '../../../data/mobData'; // todo: remove this
import itemData from '../../../data/itemData';
import Area from '../../../models/area';

export default {
  name: 'catalog',
  execute(character, typeParam) {

    const type = typeParam.toLowerCase();

    let data;
    let key;
    if (type === 'items') {
      data = itemData;
      key = 'item';
    } else if (type === 'mobs') {
      data = mobData;
    } else if (type === 'keys') {
      data = itemData;
      key = 'key';
    } else if (type === 'areas') {
      data = Object.values(Area.areaCache);
    } else {
      character.output('Unknown catalog: {types}');
    }

    let catalog;
    if (key) {
      catalog = data.catalog.filter(item => item.type === key);
    } else if (data.catalog) {
      catalog = data.catalog;
    } else {
      catalog = data;
    }

    let output = '<table><tr><th>Name</th></tr>';

    const listTable = catalog.map(({ name }) => `<tr><td>${name}</td></tr>`).join('');
    output += listTable;

    output += '</table>';

    character.output(output);
  },
};
