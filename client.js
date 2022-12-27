import { WebSocketServer } from "ws";
import crypto from "crypto";
import { supportedProducts, Views } from "./common.js";
import {
  subscribe,
  subscribeMatches,
  unsubscribe,
  showSystem,
  changeRefreshInterval,
} from "./coinbase.js";

// Create a WebSocket server
console.log("WebSocket server starting...");
const wss = new WebSocketServer({ port: 8080 });

// When a client connects to the WebSocket server, it sets up an event listener for incoming messages
wss.on("connection", (ws) => {
  console.log("Client connected");

  const clientId = crypto.randomUUID();

  function sendToClient(rawObject) {
    ws.send(JSON.stringify(rawObject));
  }

  ws.on("message", (requestMessage) => {
    const tokens = requestMessage.toString().split(" ");

    // If the first token of the message is "system", we check if there is a second token. 
    if (tokens[0] === "system") {
      // If there is a second token and it is a number, we change the refresh interval of the current view to that value. 
      if (tokens.length === 2) {
        if (!isNaN(tokens[1])) {
          const refreshInterval = tokens[1];
          console.log(
            `Changing the refresh interval of the current view to value: ${tokens[1]}`
          );
          changeRefreshInterval(clientId, refreshInterval, sendToClient);
        }
      // If there is no second token, we show the system view. 
      } else if (tokens.length === 1) {
        showSystem(clientId, sendToClient);
      // If there are more than two tokens, we log an error message.
      } else {
        console.log("Unsupported message, try again");
      }
    }
    if (tokens[0] === "quit") {
      console.log("Websocker server closing...");
      ws.close();
    }

    // If the first token of the message is in the supportedProducts array, we store it in the `product` variable.
    if (supportedProducts.includes(tokens[0])) {
      const product = tokens[0];

      // If there is a second token, we check if it is "m" or "u".
      if (tokens.length === 2) {
        // If it is "m", we subscribe to the matches view for the specified product.
        if (tokens[1] === "m") {
          subscribeMatches(Views.Match, clientId, product, sendToClient);
        }
        // If it is "u", we unsubscribe from the specified product.
        if (tokens[1] === "u") {
          unsubscribe(clientId, product);
        }
      // If there is no second token, we subscribe to the price view for the specified product.
      } else if (tokens.length === 1) {
        subscribe(Views.Price, clientId, product, sendToClient);
      } else {
        console.log("Unsupported message, try again");
      }
    }
  });
});
