import { Product } from '../types/index';
import { subscribers } from '../subscriptionData';

// The unsubscribe function removes a subscription for a client to stop receiving updates for a given product.
export function unsubscribe(clientID: string, productID: Product) {
  const subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    console.log('There is no subscriber...');
    return;
  }

  // Remove the given product from the subscribedProducts set.
  subscriber.subscribedProducts.delete(productID);
}
