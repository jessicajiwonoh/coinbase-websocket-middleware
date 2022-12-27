import WebSocket from "ws";
import { Views, supportedProducts } from "./common.js";

const URL = "wss://ws-feed.exchange.coinbase.com";

const ws = new WebSocket(URL);

let productData = Object.fromEntries(
  supportedProducts.map((productID, timestamp, tradeSize, productPrice) => [
    productID,
    { productID, bids: [], asks: [], timestamp, tradeSize, productPrice },
  ])
);

let subscribers = new Map();

let matchProducts = new Set();

// The createSubscriber function creates and returns an object representing a client that is subscribed to the server. 
export function createSubscriber(id) {
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
ws.on("message", (raw) => {
  const data = JSON.parse(raw);
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

function handleL2Update({ product_id: productID, changes }) {
  let newbids = [],
    newasks = [];
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
}) {
  productData[productID].time = timestamp;
  productData[productID].size = tradeSize;
  productData[productID].price = productPrice;
}

export function subscribeMatches(
  view,
  clientID,
  productID,
  clientSendFunction
) {
  let subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    subscriber = createSubscriber(clientID);
    subscribers.set(clientID, subscriber);
  }

  subscriber.subscribedProducts.add(productID);

  if (view === Views.Match) {
    if (
      subscriber.currentView !== Views.Match ||
      !matchProducts.has(productID)
    ) {
      subscriber.currentView = Views.Match;
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

export function subscribe(view, clientID, productID, clientSendFunction) {
  let subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    subscriber = createSubscriber(clientID);
    subscribers.set(clientID, subscriber);
  }

  subscriber.subscribedProducts.add(productID);

  if (view === Views.Price) {
    // Kick off a publishing interval if the current view wasn't already Price
    if (subscriber.currentView !== Views.Price) {
      subscriber.currentView = Views.Price;

      (function publishOnInterval() {
        const subscriber = subscribers.get(clientID);

        if (subscriber.currentView === Views.Price) {
          for (let subscribedProduct of subscriber.subscribedProducts) {
            clientSendFunction({
              subscribedProduct,
              bids: productData[subscribedProduct].bids,
              asks: productData[subscribedProduct].asks,
            });
          }
          if (subscriber.subscribedProducts.length === 0) {
            return;
          }
          setTimeout(publishOnInterval, subscriber.refreshInterval);
        }
      })();
    }
  }
}

export function unsubscribe(clientID, productID) {
  let subscriber = subscribers.get(clientID);

  if (subscriber == null) {
    console.log("There is no subscriber...");
    return;
  }
  subscriber.subscribedProducts.delete(productID);
}

export function showSystem(clientID, clientSendFunction) {
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
  clientID,
  refreshInterval,
  clientSendFunction
) {
  let subscriber = subscribers.get(clientID);
  subscriber.refreshInterval = refreshInterval;

  clientSendFunction(subscriber);
}
