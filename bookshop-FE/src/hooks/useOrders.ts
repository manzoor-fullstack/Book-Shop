import { useState, useEffect } from 'react';
import { orderService } from '@/services';
import { Order, UpdateOrderStatusData } from '@/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refetch: fetchOrders };
};

export const useOrder = (id: string | number) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderById(id);
      setOrder(response.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  return { order, loading, error, refetch: fetchOrder };
};

export const useAllOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getAllOrders();
      setOrders(response.data.orders || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch all orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string | number, data: UpdateOrderStatusData) => {
    try {
      setLoading(true);
      setError(null);
      await orderService.updateOrderStatus(id, data);
      await fetchAllOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return { orders, loading, error, updateOrderStatus, refetch: fetchAllOrders };
};
