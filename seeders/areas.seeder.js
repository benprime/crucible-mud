import { Seeder } from 'mongoose-data-seed';
import Area from '../src/models/area';
import { Types } from 'mongoose';

const data = [
  {
    "_id": Types.ObjectId("5b74b9ca62976d41dae0c288"),
    "name": "Infernal Chasm",
    "__v": 0
  },
  {
    "_id": Types.ObjectId("5b779e8971dfb628458e4d36"),
    "name": "Eastmark",
    "__v": 0
  }
];

class AreasSeeder extends Seeder {

  async shouldRun() {
    return Area.count().exec().then(count => count === 0);
  }

  async run() {
    return Area.create(data);
  }
}

export default AreasSeeder;
