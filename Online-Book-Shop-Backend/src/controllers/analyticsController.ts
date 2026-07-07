import { Response } from 'express';
import { fn, col, Op, literal } from 'sequelize';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types/express';
import {
  Book,
  Category,
  Order,
  OrderItem,
  User,
} from '../models';
import { OrderStatus } from '../enums/orderStatus.enum';

const LOW_STOCK_THRESHOLD = 10;

/**
 * Admin dashboard analytics — one call returns everything the dashboard needs.
 */
export const getDashboardAnalytics = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const [
      totalBooks,
      totalCategories,
      totalCustomers,
      totalOrders,
      pendingOrders,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      Book.count(),
      Category.count(),
      User.count({ where: { role: 'user' } }),
      Order.count(),
      Order.count({ where: { status: OrderStatus.PENDING } }),
      Book.count({ where: { stock: { [Op.lt]: LOW_STOCK_THRESHOLD, [Op.gt]: 0 } } }),
      Book.count({ where: { stock: 0 } }),
    ]);

    // Revenue = sum of non-cancelled order totals
    const revenueRow: any = await Order.findOne({
      attributes: [[fn('COALESCE', fn('SUM', col('totalAmount')), 0), 'revenue']],
      where: { status: { [Op.ne]: OrderStatus.CANCELLED } },
      raw: true,
    });
    const totalRevenue = Number(revenueRow?.revenue || 0);

    // Orders grouped by status
    const statusRows: any[] = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    const ordersByStatus: Record<string, number> = {};
    statusRows.forEach((r) => (ordersByStatus[r.status] = Number(r.count)));

    // Revenue for the last 7 days (by day)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRows: any[] = await Order.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COALESCE', fn('SUM', col('totalAmount')), 0), 'revenue'],
        [fn('COUNT', col('id')), 'orders'],
      ],
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
        status: { [Op.ne]: OrderStatus.CANCELLED },
      },
      group: [literal('DATE(createdAt)') as any],
      order: [[literal('DATE(createdAt)') as any, 'ASC']],
      raw: true,
    });

    // Build a continuous 7-day series (fill gaps with 0)
    const revenueSeries: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const match = dailyRows.find((r) => String(r.date).slice(0, 10) === key);
      revenueSeries.push({
        date: key,
        revenue: Number(match?.revenue || 0),
        orders: Number(match?.orders || 0),
      });
    }

    // Top selling books (by quantity)
    const topRows: any[] = await OrderItem.findAll({
      attributes: [
        'bookId',
        [fn('SUM', col('OrderItem.quantity')), 'sold'],
        [fn('SUM', literal('OrderItem.quantity * OrderItem.price')), 'revenue'],
      ],
      include: [{ model: Book, attributes: ['title', 'author', 'image'] }],
      group: ['bookId', 'Book.id'],
      order: [[literal('sold') as any, 'DESC']],
      limit: 5,
      raw: true,
      nest: true,
    });
    const topBooks = topRows.map((r) => ({
      bookId: r.bookId,
      title: r.Book?.title,
      author: r.Book?.author,
      image: r.Book?.image,
      sold: Number(r.sold),
      revenue: Number(r.revenue),
    }));

    // Recent orders
    const recentOrders = await Order.findAll({
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Low stock books list
    const lowStockBooks = await Book.findAll({
      where: { stock: { [Op.lt]: LOW_STOCK_THRESHOLD } },
      attributes: ['id', 'title', 'stock', 'image'],
      order: [['stock', 'ASC']],
      limit: 8,
    });

    return res.status(200).json(
      new ApiResponse(200, {
        stats: {
          totalBooks,
          totalCategories,
          totalCustomers,
          totalOrders,
          pendingOrders,
          lowStockCount,
          outOfStockCount,
          totalRevenue,
        },
        ordersByStatus,
        revenueSeries,
        topBooks,
        recentOrders,
        lowStockBooks,
      }, 'Analytics fetched')
    );
  }
);
