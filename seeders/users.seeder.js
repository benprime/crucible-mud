import { Seeder } from 'mongoose-data-seed';
import User from '../src/models/user';

const data = [
  {
    email: 'bsmithpct@gmail.com',
    username: 'Ben',
    password: 'test1test',
    actionDie: '1d2',
    admin: true,
    inventory: [],
    keys: [],
    xp: 0,
    currency: 0,
    maxHP: 10,
    currentHP: 10,  
  },
  {
    email: 'jeff@jeffmsmith.com',
    username: 'Jeff',
    password: 'test1test',
    actionDie: '1d2',
    admin: true,
    inventory: [],
    keys: [],
    xp: 0,
    currency: 0,
    maxHP: 10,
    currentHP: 10,
    },
  {
    email: 'nichmack@gmail.com',
    username: 'Nich',
    password: 'test1test',
    actionDie: '1d2',
    admin: true,
    inventory: [],
    keys: [],
    xp: 0,
    currency: 0,
    maxHP: 10,
    currentHP: 10,
    },
];

class UsersSeeder extends Seeder {

  async shouldRun() {
    return User.count().exec().then(count => count === 0);
  }

  async run() {
    return User.create(data);
  }
}

export default UsersSeeder;
