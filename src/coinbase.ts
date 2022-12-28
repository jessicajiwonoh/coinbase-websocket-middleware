import WebSocket from 'ws';
import { processMessage } from './messageProcessing';
import { throwExpression } from './common';
import {
  Ask,
  Bid,
  Product,
  ProductDataType,
  Subscriber,
  Subscribers,
} from './types/index';
import { View } from './types/view';

const URL = 'wss://ws-feed.exchange.coinbase.com';

const ws = new WebSocket(URL);

const subscribers: Subscribers = new Map();
const matchProducts: Set<Product> = new Set();

const productDataDefaults = {
  bids: Array<Bid>(),
  asks: Array<Ask>(),
  time: null,
  size: null,
  price: null,
};

// The spread operator is used to copy the properties of productDataPrototype into a new object,
// and then the productID property is added or overwritten for each object in productData.
const productData: ProductDataType = {
  'BTC-USD': { ...productDataDefaults, productID: Product.BTCUSD },
  'ETH-USD': { ...productDataDefaults, productID: Product.ETHUSD },
  'LTC-USD': { ...productDataDefaults, productID: Product.LTCUSD },
};

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

// The createSubscriber function creates and returns an object representing a client that is subscribed to the server.
export function createSubscriber(id: string): Subscriber {
  return {
    id,
    currentView: null,
    refreshInterval: 250,
    subscribedProducts: new Set(),
  };
}

ws.on('open', () => {
  console.log('Websocket connection established');

  // Subscribe directly to coinbase server.
  ws.send(
    JSON.stringify({
      type: 'subscribe',
      product_ids: Object.values(Product),
      channels: ['level2', 'matches'],
    }),
  );
});

// When the WebSocket connection receives a message, we parse it and determine its type.
ws.on('message', (raw: WebSocket.RawData) => {
  const data = JSON.parse(raw.toString());
  processMessage(data);
});

ws.on('error', error => {
  console.error(`Websocket error: ${error.message}`);
});

ws.on('close', () => {
  console.log('Websocket connection closed');
  ws.close();
});

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

// The showSystem function sends a list of the subscribed products for a client, identified by their clientID, to the client.
export function showSystem(
  clientID: string,
  clientSendFunction: (rawObject: Object) => void,
) {
  const subscriber = subscribers.get(clientID);
  // Create an empty array to hold the subscribed products of the subscriber object.
  const systemProducts = [];

  if (subscriber == null) {
    console.log('There is no subscriber...');
    return;
  }

  for (let subscribedProduct of subscriber.subscribedProducts) {
    systemProducts.push(subscribedProduct);
  }
  clientSendFunction({ clientID, systemProducts });
}

export function changeRefreshInterval(
  clientID: string,
  refreshInterval: number,
  clientSendFunction: (rawObject: Object) => void,
): void {
  const subscriber =
    subscribers.get(clientID) ??
    throwExpression(`Unexpected null clientID ${clientID}`);

  // Update the refreshInterval property of the subscriber object with the given refresh interval.
  subscriber.refreshInterval = refreshInterval;

  clientSendFunction({ refreshInterval: subscriber.refreshInterval });
}
