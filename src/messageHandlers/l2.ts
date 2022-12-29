import { updateAsks, updateBids } from '../productDataUpdater';
import { Product, L2UpdateChanges } from '../types/index';

// The l2updateMessage function processes an array of changes to the level 2 order book for a given product.
export function l2updateMessage({
  product_id: productID,
  changes,
}: {
  product_id: Product;
  changes: L2UpdateChanges;
}): void {
  const newbids = [],
    newasks = [];

  for (let [side, price, size] of changes) {
    if (side === 'buy') {
      newbids.push({ price, size });

      // If there are any new bid updates, update the bids property of the
      // productData object for the given product with the newbids array.
      if (newbids.length > 0) {
        updateBids(productID, newbids);
      }
    }
    if (side === 'sell') {
      newasks.push({ price, size });

      // If there are any new ask updates, update the asks property of the
      // productData object for the given product with the newasks array.
      if (newasks.length > 0) {
        updateAsks(productID, newasks);
      }
    }
  }
}
