import WebSocket from 'ws';
import { processMessage } from './messageProcessing';
import { Product, Subscriber } from './types/index';

const URL = 'wss://ws-feed.exchange.coinbase.com';

const ws = new WebSocket(URL);

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
