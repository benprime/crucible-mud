import { Seeder } from 'mongoose-data-seed';
import Room from '../src/models/room';

const data = [{
  name: 'Ye Olde Welcome Room',
  desc: 'This is where everyone starts!',
  x: 0,
  y: 0,
  z: 0,
  exits: [],
  inventory: [],
}];

class RoomsSeeder extends Seeder {

  async shouldRun() {
    return Room.count().exec().then(count => count === 0);
  }

  async run() {
    return Room.create(data);
  }
}

export default RoomsSeeder;
