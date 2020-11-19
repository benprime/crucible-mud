import mongoose from 'mongoose';
import ItemSchema from './itemSchema';

const Item = mongoose.model('Item', ItemSchema);

export default Item;
