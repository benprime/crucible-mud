import { Seeder } from 'mongoose-data-seed';
import Shop from '../src/models/shop';
import { Types } from 'mongoose';

const data = [{
  "_id": Types.ObjectId("5b8b13cd32358648ac323027"),
  "name": "default world",
}];

class WorldsSeeder extends Seeder {

  async shouldRun() {
    return Shop.count().exec().then(count => count === 0);
  }

  async run() {
    return Shop.create(data);
  }
}

export default WorldsSeeder;
