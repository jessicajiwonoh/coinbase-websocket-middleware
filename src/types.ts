export enum View {
  Price,
  Match,
}

export type ProductDataType = {
    [productID: string] : {
      productID: string,
      bids: { price: number, size: number }[],
      asks: { price: number, size: number }[],
      time: number | null,
      size: number | null,
      price: number | null,
    }
  };

export type Subscriber = {
  id: string,
  currentView: View | null,
  refreshInterval: number,
  subscribedProducts: Set<string>,
}

export type Subscribers = Map<string, Subscriber>

export type L2UpdateChanges = [[side: string, price: number, size: number]];