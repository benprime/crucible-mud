import mongoose from 'mongoose';
import SpawnerSchema from './spawnerSchema';

const Spawner = mongoose.model('Spawner', SpawnerSchema);

export default Spawner;