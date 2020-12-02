import { prop, getModelForClass, ReturnModelType } from '@typegoose/typegoose';

const areaCache = new Map<string, AreaDocument>();

class AreaDocument {
  @prop()
  public name: string;

  @prop()
  public parentId: string;

  public static async getById(this: ReturnModelType<typeof AreaDocument>, areaId: string): Promise<AreaDocument> {
    return areaCache[areaId];
  }

  public static async getByName(this: ReturnModelType<typeof AreaDocument>, areaName: string): Promise<AreaDocument> {
    return Object.values(areaCache).find(a => a.name.toLowerCase() === areaName)
  }

  public static async addArea(this: ReturnModelType<typeof AreaDocument>, areaName: string): Promise<AreaDocument> {
    const area = new this({ name: areaName });
    await area.save(err => { if (err) throw err; });
    areaCache[area.id] = area;
    return area;
  }

  public static async populateAreaCache(this: ReturnModelType<typeof AreaDocument>): Promise<void> {
    this.find({}, (err, result) => {
      if (err) throw err;

      result.forEach(area => {
        areaCache[area.id.toString()] = area;
      });
    });
  }

}

const AreaModel = getModelForClass(AreaDocument);
AreaModel.populateAreaCache();

export { AreaModel }