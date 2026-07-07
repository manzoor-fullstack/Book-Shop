import Order from '../models/order.models';
import OrderItem from '../models/OrderItem.models';
import Cart from '../models/Cart.models';
import CartItem from '../models/CartItem.models';
import Book from '../models/Book.models';
import User from '../models/User.models';
import ApiError from '../utils/apiError';
import sequelize from '../config/db';
import { PaymentStatus } from '../enums/paymentStatus.enum';
import {
  OrderStatus,
  ORDER_STATUS_VALUES,
  PaymentMethod,
} from '../enums/orderStatus.enum';
import { notify } from './notificationService';

interface CreateOrderOptions {
  paymentMethod?: PaymentMethod;
  shippingAddress?: string;
  stripeSessionId?: string;
  paymentIntentId?: string;
  markPaid?: boolean;
}

/**
 * Create an order from the user's cart.
 * - Validates stock for every item (prevents overbooking)
 * - Decrements book stock atomically
 * - Snapshots price at time of order
 * - Clears the cart
 */
export const createOrder = async (
  userId: number,
  options: CreateOrderOptions = {}
) => {
  const {
    paymentMethod = PaymentMethod.COD,
    shippingAddress,
    stripeSessionId,
    paymentIntentId,
    markPaid = false,
  } = options;

  const transaction = await sequelize.transaction();

  try {
    // 1. Get cart
    const cart = await Cart.findOne({ where: { userId }, transaction });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    // 2. Get cart items with book details (locked for update)
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [Book],
      transaction,
    });

    if (!items.length) {
      throw new ApiError(400, 'Cart is empty');
    }

    // 3. Validate stock and compute total
    let totalAmount = 0;
    for (const item of items) {
      const book = (item as any).Book as Book | undefined;
      if (!book) {
        throw new ApiError(404, 'A book in your cart no longer exists');
      }
      if (book.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${book.title}". Only ${book.stock} left.`
        );
      }
      totalAmount += Number(book.price) * item.quantity;
    }

    // 4. Create order
    const order = await Order.create(
      {
        userId,
        totalAmount,
        status: OrderStatus.PENDING,
        paymentStatus: markPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paymentMethod,
        shippingAddress: shippingAddress || null,
        stripeSessionId: stripeSessionId || null,
        paymentIntentId: paymentIntentId || null,
      },
      { transaction }
    );

    // 5. Create order items + decrement stock
    for (const item of items) {
      const book = (item as any).Book as Book;

      await OrderItem.create(
        {
          orderId: order.id,
          bookId: book.id,
          quantity: item.quantity,
          price: book.price,
        },
        { transaction }
      );

      await book.decrement('stock', { by: item.quantity, transaction });
    }

    // 6. Clear the cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();

    await notify({
      userId,
      title: 'Order placed',
      message: `Your order #${order.id} for $${totalAmount.toFixed(2)} has been placed successfully.`,
      type: 'order',
      link: `/my-orders`,
    });

    // Return the full order with items
    return getOrderWithItems(order.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/** Internal: load an order with its items + book info. */
const getOrderWithItems = async (orderId: number) => {
  return Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        include: [Book],
      },
    ],
  });
};

/** Get all orders belonging to a specific user. */
export const getUserOrders = async (userId: number) => {
  return Order.findAll({
    where: { userId },
    include: [
      {
        model: OrderItem,
        include: [Book],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

/** Get a single order (only if it belongs to the user). */
export const getOrderById = async (userId: number, orderId: number) => {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: [
      {
        model: OrderItem,
        include: [Book],
      },
    ],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return order;
};

/** Admin: get all orders with items and customer info. */
export const getAllOrders = async () => {
  return Order.findAll({
    include: [
      {
        model: OrderItem,
        include: [Book],
      },
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Admin: update an order's status.
 * - Validates against the allowed status set
 * - Restores stock when an order is cancelled
 */
export const updateOrderStatus = async (orderId: number, status: string) => {
  if (!status || !ORDER_STATUS_VALUES.includes(status as OrderStatus)) {
    throw new ApiError(
      400,
      `Invalid status. Allowed values: ${ORDER_STATUS_VALUES.join(', ')}`
    );
  }

  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem }],
      transaction,
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Restore stock if we are cancelling a not-yet-cancelled order
    if (
      status === OrderStatus.CANCELLED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      const orderItems = (order as any).OrderItems as OrderItem[] | undefined;
      if (orderItems?.length) {
        for (const oi of orderItems) {
          const book = await Book.findByPk(oi.bookId, { transaction });
          if (book) {
            await book.increment('stock', { by: oi.quantity, transaction });
          }
        }
      }
    }

    order.status = status;
    await order.save({ transaction });

    await transaction.commit();

    await notify({
      userId: order.userId,
      title: 'Order update',
      message: `Your order #${order.id} is now "${status}".`,
      type: 'order',
      link: `/my-orders`,
    });

    return getOrderWithItems(order.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
