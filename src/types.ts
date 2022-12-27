export enum View {
  Price,
  Match,
}

export enum Product {
  BTCUSD = 'BTC-USD',
  ETHUSD = 'ETH-USD',
  LTCUSD = 'LTC-USD',
  /*'XRP-USD', */
}

export type ProductDataType = {
  [productID in Product]: {
    productID: productID;
    bids: { price: number; size: number }[];
    asks: { price: number; size: number }[];
    time: number | null;
    size: number | null;
    price: number | null;
  };
};

export type Subscriber = {
  id: string;
  currentView: View | null;
  refreshInterval: number;
  subscribedProducts: Set<Product>;
};

export type Subscribers = Map<string, Subscriber>;

export type L2UpdateChanges = [[side: string, price: number, size: number]];
