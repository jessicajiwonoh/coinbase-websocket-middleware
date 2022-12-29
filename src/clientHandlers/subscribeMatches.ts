import { createSubscriber } from '../coinbaseWebsocket';
import { Product, View } from '../types/index';
import { matchProducts, productData, subscribers } from '../subscriptionData';

// The subscribeMatches function sets up a subscription for a client, identified by their clientID.
export function subscribeMatches(
  view: View,
  clientID: string,
  productID: Product,
  clientSendFunction: (rawObject: Object) => void,
) {
  let subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    subscriber = createSubscriber(clientID);
    subscribers.set(clientID, subscriber);
  }

  subscriber.subscribedProducts.add(productID);

  // If the view is View.Match, it sends the current state of the product to the client via clientSendFunction callback.
  // It also updates the currentView and subscribedProducts properties of the subscriber object and adds the product to the matchProducts set.
  if (view === View.Match) {
    if (
      subscriber.currentView !== View.Match ||
      !matchProducts.has(productID)
    ) {
      subscriber.currentView = View.Match;
      clientSendFunction({
        productID,
        time: productData[productID].time,
        size: productData[productID].size,
        price: productData[productID].price,
      });
    }
    matchProducts.add(productID);
  }
}
