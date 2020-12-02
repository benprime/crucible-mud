import { getModelForClass, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

// TODO: move this to its own file
enum dirEnum {
  NORTH = 'n',
  SOUTH = 's',
  EAST = 'e',
  WEST = 'w',
  NORTHEAST = 'ne',
  NORTHWEST = 'nw',
  SOUTHEAST = 'se',
  SOUTHWEST = 'sw',
  UP = 'u',
  DOWN = 'd'
}

class ExitDocument {
  @prop({ enum: dirEnum })
  dir: dirEnum;

  // todo: make this an ObjectId with a ref
  @prop()
  roomId: string;

  @prop()
  closed: boolean;

  @prop()
  keyName: string;

  @prop()
  locked: boolean;

  @prop()
  hidden: boolean;
};

const ExitModel = getModelForClass(ExitDocument);
export { ExitModel, ExitDocument };
