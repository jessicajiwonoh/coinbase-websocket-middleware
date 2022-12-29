import { productData } from './subscriptionData';
import { Ask, Bid, Product } from './types/index';

// These functions update the specified field in the productData object for the given product.
export function updateBids(productID: Product, newBids: Array<Bid>) {
  productData[productID].bids = newBids;
}

export function updateAsks(productID: Product, newAsks: Array<Ask>) {
  productData[productID].asks = newAsks;
}

export function updateTime(productID: Product, newTime: number) {
  productData[productID].time = newTime;
}

export function updateSize(productID: Product, newSize: number) {
  productData[productID].size = newSize;
}

export function updatePrice(productID: Product, newPrice: number) {
  productData[productID].price = newPrice;
}
