import { useState, useEffect } from 'react';
import { cartService } from '@/services';
import { Cart, AddToCartData, UpdateCartItemData } from '@/types';

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      // Backend returns items array directly, construct cart object
      const cartItems = response.data || [];
      const cartObj: Cart = {
        id: cartItems[0]?.cartId || 0,
        userId: 0, // Not provided by backend
        items: cartItems,
        createdAt: '',
        updatedAt: '',
      };
      setCart(cartObj);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (data: AddToCartData) => {
    try {
      setLoading(true);
      setError(null);
      await cartService.addToCart(data);
      await fetchCart(); // Refetch to get updated cart
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: string | number, data: UpdateCartItemData) => {
    try {
      setLoading(true);
      setError(null);
      await cartService.updateCartItem(itemId, data);
      await fetchCart(); // Refetch to get updated cart
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update cart item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      await cartService.removeFromCart(itemId);
      await fetchCart();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((sum, item) => {
    const price = typeof item.Book.price === 'string' ? parseFloat(item.Book.price) : item.Book.price;
    return sum + (price * item.quantity);
  }, 0) || 0;

  return {
    cart,
    loading,
    error,
    cartItemsCount,
    cartTotal,
    addToCart,
    updateQuantity: updateCartItem,
    removeItem: removeFromCart,
    refetch: fetchCart,
  };
};
