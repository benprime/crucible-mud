import mongoose from 'mongoose';
import AreaSchema from './areaSchema';

const Area = mongoose.model('Area', AreaSchema);

Area.populateAreaCache();

export default Area;
