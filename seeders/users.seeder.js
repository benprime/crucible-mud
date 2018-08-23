import { Seeder } from 'mongoose-data-seed';
import User from '../src/models/user';
import { Types } from 'mongoose';

const data = [
  {
    "_id": Types.ObjectId("5b74b95c7bf1c641880250fb"),
    "email": "bsmithpct@gmail.com",
    "username": "Ben",
    "password": "test1test",
    "admin": true,
  },
  {
    "_id": Types.ObjectId("5b74b95c7bf1c641880250fc"),
    "email": "jeff@jeffmsmith.com",
    "username": "Jeff",
    "password": "test1test",
    "admin": true,
  },
  {
    "_id": Types.ObjectId("5b74b95c7bf1c641880250fd"),
    "email": "nichmack@gmail.com",
    "username": "Nich",
    "password": "test1test",
    "admin": true,
  },
  {
    "_id": Types.ObjectId("5b74c2fbc87903b6cc0c5577"),
    "email": "fill-in-later@notanemail.com",
    "username": "Evan",
    "password": "test1test",
    "admin": true,
  },
  {
    "_id": Types.ObjectId("5b74c31bc87903b6cc0c558d"),
    "email": "not-an-email@nope.com",
    "username": "Nicholas",
    "password": "test1test",
    "admin": true,
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
