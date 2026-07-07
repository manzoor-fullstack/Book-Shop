import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from '../services/cartService';
import { AuthRequest } from '../types/express';
import { ApiResponse } from '../utils/apiResponse';

export const addItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookId, quantity } = req.body;

  await addToCart(req.user!.id, bookId, quantity);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Item added to cart'));
});

export const getUserCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const items = await getCart(req.user!.id);

    return res
      .status(200)
      .json(new ApiResponse(200, items, 'Cart fetched successfully'));
  }
);

export const updateItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { quantity } = req.body;

    const item = await updateCartItem(
      req.user!.id,
      Number(req.params.id),
      quantity
    );

    if (!item) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, 'Cart item not found or unauthorized'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, item, 'Cart item updated'));
  }
);

export const removeItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await removeCartItem(req.user!.id, Number(req.params.id));

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Item removed from cart'));
  }
);