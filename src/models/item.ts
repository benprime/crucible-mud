import { ItemType } from './enums/itemType';
import { prop, getModelForClass } from '@typegoose/typegoose';


// TODO: Does this need to exist or does it duplicate IItem?
class ItemDocument {
    @prop()
    public name: string;

    @prop()
    public desc: string;

    @prop({enum: ItemType})
    public type: string;

    @prop()
    public hidden: boolean;

    @prop()
    public range: string;

    @prop()
    public fixed: boolean;

    @prop()
    public equipSlots: string[];

    @prop()
    public damage: string;

    @prop()
    public damageType: string;

    @prop()
    public speed: string;

    @prop()
    public bonus: string;
}

  const ItemModel = getModelForClass(ItemDocument);

  export { ItemModel, ItemDocument }
