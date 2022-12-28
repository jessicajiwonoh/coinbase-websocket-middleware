import { updatePrice, updateSize, updateTime } from '../coinbase';
import { MatchUpdateType } from '../types/index';

export function matchUpdateMessage({
  product_id: productID,
  time: time,
  size: tradeSize,
  price: productPrice,
}: MatchUpdateType): void {
  if (!productID) {
    return;
  }

  updateTime(productID, time);
  updateSize(productID, tradeSize);
  updatePrice(productID, productPrice);
}
