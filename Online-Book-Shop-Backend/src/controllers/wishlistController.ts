import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types/express';
import { Wishlist, Book, Category } from '../models';

/** Get the user's wishlist with book details. */
export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await Wishlist.findAll({
    where: { userId: req.user!.id },
    include: [{ model: Book, include: [{ model: Category, attributes: ['id', 'name'] }] }],
    order: [['createdAt', 'DESC']],
  });
  return res.status(200).json(new ApiResponse(200, items, 'Wishlist fetched'));
});

/** Add a book to the wishlist (idempotent). */
export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookId } = req.body;
  if (!bookId) throw new ApiError(400, 'bookId is required');

  const book = await Book.findByPk(bookId);
  if (!book) throw new ApiError(404, 'Book not found');

  const [item, created] = await Wishlist.findOrCreate({
    where: { userId: req.user!.id, bookId },
  });

  return res
    .status(created ? 201 : 200)
    .json(new ApiResponse(created ? 201 : 200, item, created ? 'Added to wishlist' : 'Already in wishlist'));
});

/** Remove a book from the wishlist by bookId. */
export const removeFromWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const bookId = Number(req.params.bookId);
    const deleted = await Wishlist.destroy({
      where: { userId: req.user!.id, bookId },
    });
    if (!deleted) throw new ApiError(404, 'Item not in wishlist');
    return res.status(200).json(new ApiResponse(200, null, 'Removed from wishlist'));
  }
);
