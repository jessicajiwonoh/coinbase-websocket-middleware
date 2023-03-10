import { WebSocketServer } from 'ws';
import * as crypto from 'crypto';
import { Product, View } from './types/index';
import {
  changeRefreshInterval,
  showSystem,
  subscribe,
  subscribeMatches,
  unsubscribe,
} from './clientHandlers/index';

// Create a WebSocket server
console.log('WebSocket server starting...');
const wss = new WebSocketServer({ port: 8080 });

function sendToClient(ws: import('ws').WebSocket, rawObject: Object): void {
  ws.send(JSON.stringify(rawObject));
}

// When a client connects to the WebSocket server, it sets up an event listener for incoming messages
wss.on('connection', ws => {
  console.log('Client connected');

  const clientId = crypto.randomUUID();

  ws.on('message', requestMessage => {
    const tokens = requestMessage.toString().split(' ');

    // If the first token of the message is "system", we check if there is a second token.
    if (tokens[0] === 'system') {
      // If there is a second token and it is a number, we change the refresh interval of the current view to that value.
      if (tokens.length === 2) {
        const refreshInterval = parseInt(tokens[1]);
        console.log(
          `Changing the refresh interval of the current view to value: ${tokens[1]}`,
        );
        changeRefreshInterval(clientId, refreshInterval, rawObject => {
          sendToClient(ws, rawObject);
        });
        // If there is no second token, we show the system view.
      } else if (tokens.length === 1) {
        showSystem(clientId, rawObject => {
          sendToClient(ws, rawObject);
        });
        // If there are more than two tokens, we log an error message.
      } else {
        console.log('Unsupported message, try again');
      }
    }
    if (tokens[0] === 'quit') {
      console.log('Websocker server closing...');
      ws.close();
    }

    // If the first token of the message is in the Product enum, we store it in the `product` variable.
    if (Object.values<string>(Product).includes(tokens[0])) {
      const product = tokens[0] as Product;

      // If there is a second token, we check if it is "m" or "u".
      if (tokens.length === 2) {
        // If it is "m", we subscribe to the matches view for the specified product.
        if (tokens[1] === 'm') {
          subscribeMatches(View.Match, clientId, product, rawObject => {
            sendToClient(ws, rawObject);
          });
        }
        // If it is "u", we unsubscribe from the specified product.
        if (tokens[1] === 'u') {
          unsubscribe(clientId, product);
        }
        // If there is no second token, we subscribe to the price view for the specified product.
      } else if (tokens.length === 1) {
        subscribe(View.Price, clientId, product, rawObject => {
          sendToClient(ws, rawObject);
        });
      } else {
        console.log('Unsupported message, try again');
      }
    }
  });
});
