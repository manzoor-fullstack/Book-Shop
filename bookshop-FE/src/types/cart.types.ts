import { Book } from './book.types';

export interface CartItem {
  id: number;
  cartId: number;
  bookId: number;
  quantity: number;
  Book: Book; // Backend returns "Book" with capital B
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  bookId: number;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface CartResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: CartItem[]; // Backend returns items array directly, not wrapped in cart object
}
