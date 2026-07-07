import { Response } from 'express';
import { Op, fn, col } from 'sequelize';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types/express';
import { User, Order } from '../models';

const SAFE_ATTRS = [
  'id',
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
  'profileImage',
  'role',
  'isActive',
  'createdAt',
];

/** Admin: list customers with search + pagination + order counts. */
export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || '';
  const role = req.query.role as string;

  const where: any = {};
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }
  if (role === 'user' || role === 'admin') where.role = role;

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: SAFE_ATTRS,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  // Attach order counts + total spent per user
  const stats: any[] = await Order.findAll({
    attributes: [
      'userId',
      [fn('COUNT', col('id')), 'orderCount'],
      [fn('COALESCE', fn('SUM', col('totalAmount')), 0), 'totalSpent'],
    ],
    group: ['userId'],
    raw: true,
  });
  const statMap: Record<number, { orderCount: number; totalSpent: number }> = {};
  stats.forEach((s) => {
    statMap[s.userId] = {
      orderCount: Number(s.orderCount),
      totalSpent: Number(s.totalSpent),
    };
  });

  const users = rows.map((u) => ({
    ...u.toJSON(),
    orderCount: statMap[u.id]?.orderCount || 0,
    totalSpent: statMap[u.id]?.totalSpent || 0,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { count, page, limit, users }, 'Users fetched'));
});

/** Admin: get a single user with their orders. */
export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(Number(req.params.id), {
    attributes: SAFE_ATTRS,
    include: [{ model: Order, separate: true, order: [['createdAt', 'DESC']] }],
  });
  if (!user) throw new ApiError(404, 'User not found');
  return res.status(200).json(new ApiResponse(200, user, 'User fetched'));
});

/** Admin: toggle active status (block / unblock a customer). */
export const toggleUserActive = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findByPk(Number(req.params.id));
    if (!user) throw new ApiError(404, 'User not found');
    if (user.id === req.user!.id) {
      throw new ApiError(400, 'You cannot deactivate your own account');
    }
    user.isActive = !user.isActive;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, { id: user.id, isActive: user.isActive }, 'User updated'));
  }
);

/** Admin: change a user's role. */
export const updateUserRole = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { role } = req.body;
    if (role !== 'user' && role !== 'admin') {
      throw new ApiError(400, 'Role must be "user" or "admin"');
    }
    const user = await User.findByPk(Number(req.params.id));
    if (!user) throw new ApiError(404, 'User not found');
    user.role = role;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, { id: user.id, role: user.role }, 'Role updated'));
  }
);
