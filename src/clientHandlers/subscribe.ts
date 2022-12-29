import { createSubscriber } from '../coinbaseWebsocket';
import { throwExpression } from '../common';
import { Product, View } from '../types/index';
import { productData, subscribers } from '../subscriptionData';

// Subscribe to this middleware server from websocket client
export function subscribe(
  view: View,
  clientID: string,
  productID: Product,
  clientSendFunction: (rawObject: Object) => void,
) {
  // Retrieve the subscriber object for the given client ID from the subscribers map.
  // Or create a new subscriber object if it doesn't exist.
  let subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    subscriber = createSubscriber(clientID);
    subscribers.set(clientID, subscriber);
  }

  // Add the given product to the subscribedProducts set.
  subscriber.subscribedProducts.add(productID);

  if (view === View.Price) {
    // Kick off a publishing loop if the current view wasn't already Price
    if (subscriber.currentView !== View.Price) {
      subscriber.currentView = View.Price;

      // Create a new scope for the publishOnInterval function, then called immediately.
      // This allows publishOnInterval function to be called recursively via the setTimeout function without polluting the global scope.
      (function publishOnInterval() {
        const subscriber =
          subscribers.get(clientID) ??
          throwExpression(`Unexpected null clientID ${clientID}`);

        if (subscriber.currentView === View.Price) {
          for (let subscribedProduct of subscriber.subscribedProducts) {
            clientSendFunction({
              subscribedProduct,
              bids: productData[subscribedProduct].bids,
              asks: productData[subscribedProduct].asks,
            });
          }
          if (subscriber.subscribedProducts.size === 0) {
            return;
          }
          setTimeout(publishOnInterval, subscriber.refreshInterval);
        }
      })();
    }
  }
}
