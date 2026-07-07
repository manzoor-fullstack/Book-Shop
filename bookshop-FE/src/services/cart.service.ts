import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { CartResponse, AddToCartData, UpdateCartItemData } from '@/types';

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    const response = await axiosInstance.get<CartResponse>(
      API_ENDPOINTS.CART.GET
    );
    return response.data;
  },

  addToCart: async (data: AddToCartData): Promise<CartResponse> => {
    const response = await axiosInstance.post<CartResponse>(
      API_ENDPOINTS.CART.ADD,
      data
    );
    return response.data;
  },

  updateCartItem: async (
    itemId: string | number,
    data: UpdateCartItemData
  ): Promise<CartResponse> => {
    const response = await axiosInstance.put<CartResponse>(
      API_ENDPOINTS.CART.UPDATE(itemId),
      data
    );
    return response.data;
  },

  removeFromCart: async (itemId: string | number) => {
    const response = await axiosInstance.delete(
      API_ENDPOINTS.CART.REMOVE(itemId)
    );
    return response.data;
  },
};
