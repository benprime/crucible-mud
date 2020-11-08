import { Seeder } from 'mongoose-data-seed';
import Shop from '../src/models/shop';
import { Types } from 'mongoose';

const data = [

];

class ShopsSeeder extends Seeder {

  async shouldRun() {
    return Shop.count().exec().then(count => count === 0);
  }

  async run() {
    return Shop.create(data);
  }
}

export default ShopsSeeder;
