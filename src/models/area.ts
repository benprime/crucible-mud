import mongoose from 'mongoose';
//import AreaSchema from './areaSchema';

import { model, Schema, Document, Types, Model } from 'mongoose'


const areaCache = new Map<string, IArea>();

interface IArea {
  name: string,
  parentId: string,
}

interface IAreaDoc extends IArea, Document {
    // instance methods
}

interface IAreaModel extends Model<IAreaDoc> {
    // static methods
    areaCache: IAreaDoc[];
    getById(areaId: string): Promise<IAreaDoc>;
    addArea(areaName: string): Promise<IAreaDoc>;
    populateAreaCache(): void;
}

const AreaSchemaFields: Record<keyof IArea, any> = {
    name: { type: String },
    parentId: { type: String },
  };

  const AreaSchema = new mongoose.Schema(AreaSchemaFields);

  AreaSchema.statics.areaCache = areaCache;

  AreaSchema.statics.getById = (areaId: string) => {
    return areaCache[areaId];
  };

  AreaSchema.statics.getByName = (areaName: string) => {
    return Object.values(areaCache).find(a => a.name.toLowerCase() === areaName);
  };

  AreaSchema.statics.addArea = function (areaName) {
    const area = new this({ name: areaName });
    area.save(err => { if (err) throw err; });
    areaCache[area.id] = area;
    return area;
  };

  // todo: this should return a promise
  AreaSchema.statics.populateAreaCache = function () {
    this.find({}, (err, result) => {
      if (err) throw err;

      result.forEach(area => {
        areaCache[area.id.toString()] = area;
      });

    });
  };

const Area = model<IAreaDoc, IAreaModel>('Area', AreaSchema);
Area.populateAreaCache();

export { Area, IArea }