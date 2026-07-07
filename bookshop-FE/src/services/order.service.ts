import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { OrderResponse, OrdersResponse, UpdateOrderStatusData } from '@/types';

export interface CheckoutData {
  paymentMethod?: 'cod' | 'card';
  shippingAddress?: string;
}

export const orderService = {
  createOrder: async (data?: CheckoutData): Promise<OrderResponse> => {
    const response = await axiosInstance.post<OrderResponse>(
      API_ENDPOINTS.ORDERS.CREATE,
      data || {}
    );
    return response.data;
  },

  getInvoice: async (id: string | number) => {
    const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.INVOICE(id));
    return response.data.data;
  },

  getMyOrders: async (): Promise<OrdersResponse> => {
    const response = await axiosInstance.get<OrdersResponse>(
      API_ENDPOINTS.ORDERS.MY_ORDERS
    );
    return response.data;
  },

  getOrderById: async (id: string | number): Promise<OrderResponse> => {
    const response = await axiosInstance.get<OrderResponse>(
      API_ENDPOINTS.ORDERS.DETAIL(id)
    );
    return response.data;
  },

  getAllOrders: async (): Promise<OrdersResponse> => {
    const response = await axiosInstance.get<OrdersResponse>(
      API_ENDPOINTS.ORDERS.ALL
    );
    return response.data;
  },

  updateOrderStatus: async (
    id: string | number,
    data: UpdateOrderStatusData
  ): Promise<OrderResponse> => {
    const response = await axiosInstance.put<OrderResponse>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
      data
    );
    return response.data;
  },
};
