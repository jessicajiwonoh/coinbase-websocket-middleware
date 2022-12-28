export enum Product {
  BTCUSD = 'BTC-USD',
  ETHUSD = 'ETH-USD',
  LTCUSD = 'LTC-USD',
  /*'XRP-USD', */
}

export type ProductDataType = {
  [productID in Product]: {
    productID: productID;
    bids: Bid[];
    asks: Ask[];
    time: number | null;
    size: number | null;
    price: number | null;
  };
};

interface BidsAndAsks {
  price: number;
  size: number;
}

export interface Bid extends BidsAndAsks {}
export interface Ask extends BidsAndAsks {}
