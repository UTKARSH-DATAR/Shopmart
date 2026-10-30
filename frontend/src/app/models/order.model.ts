import { Address } from './address.model';
import { Product } from './product.model';
import { User } from './user.model';

// Represents an individual purchased line item inside a finalized order
export interface OrderItem {
  id?: number;
  product: Product;
  price: number; // Historical price locked at purchase time
  quantity: number;
}

// Complete Order entity matching backend /api/orders
export interface Order {
  id?: number;
  orderNumber?: string; // Generated code e.g. "SHPMRT000001"
  orderDate?: string | Date;
  totalAmount: number;
  status?: 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'Cancelled' | string;
  cardNumber?: string; // Last 4 digits or card number entered during payment
  user?: User;
  shippingAddress: Address;
  items: OrderItem[];
}
