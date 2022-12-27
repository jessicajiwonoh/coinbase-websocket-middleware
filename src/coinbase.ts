import WebSocket from "ws";
import { supportedProducts, throwExpression } from "./common";
import { L2UpdateChanges, ProductDataType, Subscriber, Subscribers, View } from "./types";

const URL = "wss://ws-feed.exchange.coinbase.com";

const ws = new WebSocket(URL);

let productData: ProductDataType = Object.fromEntries(
  supportedProducts.map((productID: string) => [
    productID,
    { productID, bids: [], asks: [], time: null, size: null, price: null },
  ])
);

let subscribers: Subscribers  = new Map();

let matchProducts = new Set();

// The createSubscriber function creates and returns an object representing a client that is subscribed to the server. 
export function createSubscriber(id: string): Subscriber {
  return {
    id,
    currentView: null,
    refreshInterval: 250,
    subscribedProducts: new Set(),
  };
}

ws.on("open", () => {
  console.log("Websocket connection established");

  ws.send(
    JSON.stringify({
      type: "subscribe",
      product_ids: supportedProducts,
      channels: ["level2", "matches"],
    })
  );
});

// When the WebSocket connection receives a message, we parse it and determine its type. 
ws.on("message", (raw: WebSocket.RawData) => {
  const data = JSON.parse(raw.toString());
  const { type } = data;

  switch (type) {
    case "subscriptions":
      for (let channel of data.channels) {
        console.log(
          `Product IDs subscribed to: ${channel.name} channel, ${channel.product_ids}`
        );
      }
      break;
    case "snapshot":
      break;
    case "l2update":
      handleL2Update(data);
      break;
    case "last_match":
    case "match":
      handleMatchUpdate(data);
      break;
    case "error":
      console.log(data);
      break;
    default:
      console.log(`${type} type not supported`);
      ws.close();
  }
});

ws.on("error", (error) => {
  console.error(`Websocket error: ${error.message}`);
});

ws.on("close", () => {
  console.log("Websocket connection closed");
  ws.close();
});

function handleL2Update({ product_id: productID, changes }: 
  {product_id: string, changes: L2UpdateChanges}): void {

  let newbids = [], newasks = [];

  for (let [side, price, size] of changes) {
    if (side === "buy") {
      newbids.push({ price, size });
    }
    if (side === "sell") {
      newasks.push({ price, size });
    }
  }
  if (newbids.length > 0) {
    productData[productID].bids = newbids;
  }
  if (newasks.length > 0) {
    productData[productID].asks = newasks;
  }
}

function handleMatchUpdate({
  product_id: productID,
  time: timestamp,
  size: tradeSize,
  price: productPrice,
}: { product_id: string, time: number, size: number, price: number }): void {
  productData[productID].time = timestamp;
  productData[productID].size = tradeSize;
  productData[productID].price = productPrice;
}

export function subscribeMatches(
  view: View,
  clientID: string,
  productID: string,
  clientSendFunction: (rawObject: Object) => void
) {
  let subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    subscriber = createSubscriber(clientID);
    subscribers.set(clientID, subscriber);
  }

  subscriber.subscribedProducts.add(productID);

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

export function subscribe(view: View, clientID: string, productID: string, clientSendFunction: (rawObject: Object) => void) {
  let subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    subscriber = createSubscriber(clientID);
    subscribers.set(clientID, subscriber);
  }

  subscriber.subscribedProducts.add(productID);

  if (view === View.Price) {
    // Kick off a publishing interval if the current view wasn't already Price
    if (subscriber.currentView !== View.Price) {
      subscriber.currentView = View.Price;

      (function publishOnInterval() {
        const subscriber = subscribers.get(clientID) 
          ?? throwExpression(`Unexpected null clientID ${clientID}`);
          
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

export function unsubscribe(clientID: string, productID: string) {
  let subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    console.log("There is no subscriber...");
    return;
  }
  subscriber.subscribedProducts.delete(productID);
}

export function showSystem(clientID: string, clientSendFunction: { (rawObject: Object): void; (arg0: { clientID: any; systemProducts: any[]; }): void; }) {
  let subscriber = subscribers.get(clientID);
  let systemProducts = [];

  if (subscriber == null) {
    console.log("There is no subscriber...");
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
  clientSendFunction: (rawObject: Object) => void
): void {
  let subscriber = subscribers.get(clientID) 
    ?? throwExpression(`Unexpected null clientID ${clientID}`);

  subscriber.refreshInterval = refreshInterval;

  clientSendFunction(subscriber);
}
