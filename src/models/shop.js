import mongoose from 'mongoose';
import ShopSchema from './shopSchema';

const Shop = mongoose.model('Shop', ShopSchema);

Shop.populateShopCache();

export default Shop;
