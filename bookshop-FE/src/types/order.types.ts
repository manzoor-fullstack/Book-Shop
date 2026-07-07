import { Book } from './book.types';
import { User } from './auth.types';

export interface OrderItem {
  id: number;
  orderId: number;
  bookId: number;
  quantity: number;
  price: number;
  book: Book;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  user?: User;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusData {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface OrderResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    order: Order;
  };
}

export interface OrdersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    orders: Order[];
  };
}
