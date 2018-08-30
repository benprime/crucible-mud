import { Seeder } from 'mongoose-data-seed';
import Shop from '../src/models/shop';
import { Types } from 'mongoose';

const data = [
  {
    "_id": Types.ObjectId("5b8633b66c920f0c416d0357"),
    "roomId": "5b779fd3f25fe128bd016f70",
    "currency": 0,
    "stock": [
      {
        "itemTypeName": "short sword",
        "quantity": 10,
        "_id": Types.ObjectId("5b8633c96c920f0c416d035a")
      },
      {
        "itemTypeName": "great sword",
        "quantity": 10,
        "_id": Types.ObjectId("5b8633ce6c920f0c416d035b")
      }
    ],
    "__v": 2
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
