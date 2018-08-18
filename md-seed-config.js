import mongooseLib from 'mongoose';
mongooseLib.Promise = global.Promise;

import Areas from './seeders/areas.seeder';
import Characters from './seeders/characters.seeder';
import Rooms from './seeders/rooms.seeder';
import Users from './seeders/users.seeder';

// Export the mongoose lib
export const mongoose = mongooseLib;

// Export the mongodb url
export const mongoURL = process.env.MONGO_DB && process.env.MONGO_PORT
  ? `mongodb://localhost:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
  : 'mongodb://localhost:27017/mud';

/*
  Seeders List
  ------
  order is important
*/
export const seedersList = {
  Areas,
  Characters,
  Rooms,
  Users,
};
