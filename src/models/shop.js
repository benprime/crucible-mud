import mongoose from 'mongoose';
import ShopSchema from './shopSchema';

const Shop = mongoose.model('Shop', ShopSchema);

// Working around a mongoose issue where the indexes aren't getting created.
Shop.createIndexes();

Shop.populateShopCache();

export default Shop;
