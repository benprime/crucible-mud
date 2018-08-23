import { Seeder } from 'mongoose-data-seed';
import Shop from '../src/models/shop';
import { Types } from 'mongoose';

const data = [
  {
    "_id": Types.ObjectId("5b77bd754d2d7858611e1293"),
    "roomId": "5b779fd3f25fe128bd016f70",
    "stock": [
      {
        "itemTypeName": "shortsword",
        "quantity": 10,
        "_id": Types.ObjectId("5b77be4b492a2f5a3654f909")
      },
      {
        "itemTypeName": "torch",
        "quantity": 20,
        "_id": Types.ObjectId("5b77c667422dac6893dfb922")
      }
    ],
    "__v": 2,
    "currency": 32
  }
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
