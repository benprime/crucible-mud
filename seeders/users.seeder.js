import { Seeder } from 'mongoose-data-seed';
import User from '../src/models/user';
import { Types } from 'mongoose';

const data = [
  {
    '_id': Types.ObjectId('5b74b95c7bf1c641880250fb'),
    'email': 'bsmithpct@gmail.com',
    'password': '$2b$10$YyNQ8Xbqvh7Sqr9IyN6fLeHLIXYxL9jXxvW4LuyJUDRgfIzO/3xIW',
    'admin': true,
    'debug': false,
    'verified': true,
  },
  {
    '_id': Types.ObjectId('5b74b95c7bf1c641880250fc'),
    'email': 'jeff@jeffmsmith.com',
    'password': '$2b$10$YyNQ8Xbqvh7Sqr9IyN6fLeHLIXYxL9jXxvW4LuyJUDRgfIzO/3xIW',
    'admin': true,
    'debug': false,
    'verified': true,
  },
  {
    '_id': Types.ObjectId('5b74b95c7bf1c641880250fd'),
    'email': 'nichmack@gmail.com',
    'password': '$2b$10$YyNQ8Xbqvh7Sqr9IyN6fLeHLIXYxL9jXxvW4LuyJUDRgfIzO/3xIW',
    'admin': true,
    'debug': false,
    'verified': true,
  },
  {
    '_id': Types.ObjectId('5b74c2fbc87903b6cc0c5577'),
    'email': 'fill-in-later@notanemail.com',
    'password': '$2b$10$YyNQ8Xbqvh7Sqr9IyN6fLeHLIXYxL9jXxvW4LuyJUDRgfIzO/3xIW',
    'admin': true,
    'debug': false,
    'verified': true,
  },
  {
    '_id': Types.ObjectId('5b74c31bc87903b6cc0c558d'),
    'email': 'not-an-email@nope.com',
    'password': '$2b$10$YyNQ8Xbqvh7Sqr9IyN6fLeHLIXYxL9jXxvW4LuyJUDRgfIzO/3xIW',
    'admin': true,
    'debug': false,
    'verified': true,
  }];

class UsersSeeder extends Seeder {

  async shouldRun() {
    return User.count().exec().then(count => count === 0);
  }

  async run() {
    return User.create(data);
  }
}

export default UsersSeeder;
