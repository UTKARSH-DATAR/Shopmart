import { Product } from './product.model';
import { User } from './user.model';

// CartItem represents an item stored in the customer's active shopping cart
export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
  user?: User;
}
