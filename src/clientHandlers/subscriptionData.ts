import {
  Ask,
  Bid,
  Product,
  ProductDataType,
  Subscribers,
} from '../types/index';

export const subscribers: Subscribers = new Map();
export const matchProducts: Set<Product> = new Set();

const productDataDefaults = {
  bids: Array<Bid>(),
  asks: Array<Ask>(),
  time: null,
  size: null,
  price: null,
};

// The spread operator is used to copy the properties of productDataPrototype into a new object,
// and then the productID property is added or overwritten for each object in productData.
export const productData: ProductDataType = {
  'BTC-USD': { ...productDataDefaults, productID: Product.BTCUSD },
  'ETH-USD': { ...productDataDefaults, productID: Product.ETHUSD },
  'LTC-USD': { ...productDataDefaults, productID: Product.LTCUSD },
};
