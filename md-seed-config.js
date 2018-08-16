import mongooseLib from 'mongoose';
mongooseLib.Promise = global.Promise;

import Areas from './seeders/areas.seeder';
import Rooms from './seeders/rooms.seeder';
import Users from './seeders/users.seeder';

// Export the mongoose lib
export const mongoose = mongooseLib;

// Export the mongodb url
export const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/mud';

/*
  Seeders List
  ------
  order is important
*/
export const seedersList = {
  Areas,
  Rooms,
  Users,
};
