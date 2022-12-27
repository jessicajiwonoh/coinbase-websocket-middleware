# Coinbase Websocket Middleware

This application works as a middleware from coinbase and the client.
It was created by using NodeJS for the webserver that will intereact with the Coinbase Pro websocket API (https://docs.cloud.coinbase.com/exchange/docs/websocket-overview)and send the information through a websocket client.

## Requirements

- A user should be able to type the exact name of the symbol (BTC-USD, ETH-USD, XRP-USD, LTC-USD) and start a streaming of prices for the following 4 products.

- The request messages from the client side will be:
- `quit`: quit
- `<symbol>`: price view
- `<symbol>` m: matches view
- `<symbol>` u: unsubscribe symbol
- `system`: show system status
- `system <number>`: change the refresh interval of the current view to another value

- Support multiple terminal users, where each user can be subscribed to different currencies.
- A user should only see updates for the pairs that they are subscribed to.
- The webserver must handle all incoming prices updates and then send them to the right subscribed user.

## Getting Started

### Installing Dependencies

- `npm install`

#### Running the server & Sending requests from the client

- To run: `ts-node-esm src/client.ts`
- Open Simple Websocket Client: URL `ws://localhost:8080`
- Send a request to subscribe (symbol: BTC-USD) and see the price view: `BTC-USD`
- Send a request to subscribe (symbol: ETH-USD) and see the price view: `ETH-USD`
- Send a request to see the matches view: `${symbol} m`
- Send a request to see the matches view: `${symbol} m`
- Send a request to unsubscribe: `${symbol} u`
- Send a request to unsubscribe: `${symbol} u`
- Send a request to show system status: `system`
- Send a request to change the refresh interval of the current view to another value: `system ${number}`

## Notes

- XRP-USD is not getting supported by Coinbase PRO API so it currently is commented out.
