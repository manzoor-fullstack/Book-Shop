import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { createOrder, getAllOrders, getOrderById, getUserOrders, updateOrderStatus } from '../services/orderService';
import { AuthRequest } from '../types/express';
import { ApiResponse } from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import { Order, OrderItem, Book, User } from '../models';

export const createUserOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { paymentMethod, shippingAddress } = req.body || {};

    const order = await createOrder(req.user!.id, {
      paymentMethod,
      shippingAddress,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, 'Order placed successfully'));
  }
);

// Get all orders for a user
export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orders = await getUserOrders(req.user!.id);

    return res
      .status(200)
      .json(new ApiResponse(200, orders, 'Orders fetched successfully'));
  }
);

// Get order by ID
export const getOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await getOrderById(
      req.user!.id,
      Number(req.params.id)
    );

    return res
      .status(200)
      .json(new ApiResponse(200, order, 'Order fetched'));
  }
);

// Admin get all orders
export const getOrdersAdmin = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const orders = await getAllOrders();

    return res
      .status(200)
      .json(new ApiResponse(200, orders, 'All orders fetched'));
  }
);

// Admin update order status
export const updateStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;

    const order = await updateOrderStatus(
      Number(req.params.id),
      status
    );

    return res
      .status(200)
      .json(new ApiResponse(200, order, 'Order status updated'));
  }
);

// Invoice data for an order (owner or admin)
export const getInvoice = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orderId = Number(req.params.id);

    const order = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, include: [{ model: Book, attributes: ['title', 'author'] }] },
        { model: User, attributes: ['firstName', 'lastName', 'email', 'phone', 'address'] },
      ],
    });

    if (!order) throw new ApiError(404, 'Order not found');

    // Only the owner or an admin can view the invoice
    if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
      throw new ApiError(403, 'Not allowed to view this invoice');
    }

    const items = ((order as any).OrderItems || []).map((oi: any) => ({
      title: oi.Book?.title || 'Unknown',
      author: oi.Book?.author || '',
      quantity: oi.quantity,
      price: oi.price,
      lineTotal: Number(oi.price) * oi.quantity,
    }));

    const invoice = {
      invoiceNumber: `INV-${String(order.id).padStart(6, '0')}`,
      issuedAt: order.createdAt,
      shop: { name: 'BookShop', address: '12 Mall Road, Lahore', email: 'billing@bookshop.com' },
      customer: (order as any).User,
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
      },
      items,
      subtotal: order.totalAmount,
      total: order.totalAmount,
    };

    return res.status(200).json(new ApiResponse(200, invoice, 'Invoice generated'));
  }
);