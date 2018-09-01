import mongoose from 'mongoose';
import WorldSchema from './worldSchema';

const World = mongoose.model('World', WorldSchema);

export default World;
