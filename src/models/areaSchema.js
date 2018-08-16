import mongoose from 'mongoose';


const areaCache = {};

const AreaSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

AreaSchema.statics.areaCache = areaCache;

AreaSchema.statics.getById = areaId => {
  return areaCache[areaId];
};

AreaSchema.statics.getByName = areaName => {
  return Object.values(areaCache).find(a => a.name.toLowerCase() === areaName);
};

AreaSchema.statics.addArea = function (areaName) {
  const area = new this({ name: areaName });
  area.save(err => { if (err) throw err; });
  areaCache[area.id] = area;
  return area;
};

AreaSchema.statics.populateAreaCache = function () {
  this.find({}, (err, result) => {
    if (err) throw err;

    result.forEach(area => {
      areaCache[area.id.toString()] = area;
    });

  });
};

export default AreaSchema;
