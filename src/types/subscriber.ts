import { Product } from './product';
import { View } from './view';

export type Subscriber = {
  id: string;
  currentView: View | null;
  refreshInterval: number;
  subscribedProducts: Set<Product>;
};

export type Subscribers = Map<string, Subscriber>;
