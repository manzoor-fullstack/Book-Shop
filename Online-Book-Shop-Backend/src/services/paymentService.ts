import Stripe from 'stripe';
import Cart from '../models/Cart.models';
import CartItem from '../models/CartItem.models';
import Book from '../models/Book.models';
import ApiError from '../utils/apiError';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (userId: number) => {
  const cart = await Cart.findOne({ where: { userId } });

  if (!cart) throw new ApiError(404, 'Cart not found');

  const items = await CartItem.findAll({
    where: { cartId: cart.id },
    include: [Book],
  });

  if (items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const line_items = items.map((item: any) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.Book.title,
      },
      unit_amount: item.Book.price * 100, // cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: process.env.STRIPE_CANCEL_URL,
    metadata: {
      userId: String(userId),
      cartId: String(cart.id),
    },
  });

  return session.url;
};