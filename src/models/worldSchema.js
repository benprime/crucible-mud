import mongoose from 'mongoose';

const worldCache = {};

const WorldSchema = new mongoose.Schema({
  name: { type: String },
});

WorldSchema.statics.worldCache = worldCache;

WorldSchema.statics.getById = worldId => {
  return worldCache[worldId];
};

WorldSchema.statics.getByName = worldName => {
  return Object.values(worldCache).find(a => a.name.toLowerCase() === worldName);
};

WorldSchema.statics.createWorld = function (worldName) {
  const world = new this({ name: worldName });
  world.save(err => { if (err) throw err; });
  worldCache[world.id] = world;
  return world;
};

WorldSchema.statics.populateWorldCache = function () {
  this.find({}, (err, result) => {
    if (err) throw err;

    result.forEach(world => {
      worldCache[world.id] = world;
    });

  });
};

export default WorldSchema;
