import { Seeder } from 'mongoose-data-seed';
import User from '../src/models/user';
import { Types } from 'mongoose';

const data = [
  {
    "_id": Types.ObjectId("5b74b95c7bf1c641880250fb"),
    "email": "bsmithpct@gmail.com",
    "password": "test1test",
    "admin": true,
    "debug": false,
  },
  {
    "_id": Types.ObjectId("5b74b95c7bf1c641880250fc"),
    "email": "jeff@jeffmsmith.com",
    "password": "test1test",
    "admin": true,
    "debug": false,
  },
  {
    "_id": Types.ObjectId("5b74b95c7bf1c641880250fd"),
    "email": "nichmack@gmail.com",
    "password": "test1test",
    "admin": true,
    "debug": false,
  },
  {
    "_id": Types.ObjectId("5b74c2fbc87903b6cc0c5577"),
    "email": "fill-in-later@notanemail.com",
    "password": "test1test",
    "admin": true,
    "debug": false,
  },
  {
    "_id": Types.ObjectId("5b74c31bc87903b6cc0c558d"),
    "email": "not-an-email@nope.com",
    "password": "test1test",
    "admin": true,
    "debug": false,
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
