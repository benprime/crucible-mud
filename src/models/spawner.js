const mongoose = require('mongoose');
const SpawnerSchema = require('./spawnerSchema');

const Spawner = mongoose.model('Spawner', SpawnerSchema);

module.exports = Spawner;