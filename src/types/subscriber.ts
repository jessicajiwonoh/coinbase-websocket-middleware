import { Product, View } from './index';

export type Subscriber = {
  id: string;
  currentView: View | null;
  refreshInterval: number;
  subscribedProducts: Set<Product>;
};

export type Subscribers = Map<string, Subscriber>;
