import { Product } from './product';

export interface MatchUpdateType {
  product_id: Product;
  time: number;
  size: number;
  price: number;
}
