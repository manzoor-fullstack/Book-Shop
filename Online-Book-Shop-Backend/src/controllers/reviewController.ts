import { Response } from 'express';
import { fn, col } from 'sequelize';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types/express';
import { Review, User, Book } from '../models';

/** Public: list reviews for a book + aggregate rating. */
export const getBookReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const bookId = Number(req.params.bookId);

    const reviews = await Review.findAll({
      where: { bookId },
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'profileImage'] }],
      order: [['createdAt', 'DESC']],
    });

    const agg: any = await Review.findOne({
      attributes: [
        [fn('AVG', col('rating')), 'average'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { bookId },
      raw: true,
    });

    return res.status(200).json(
      new ApiResponse(200, {
        reviews,
        average: Number(agg?.average || 0),
        count: Number(agg?.count || 0),
      }, 'Reviews fetched')
    );
  }
);

/** Authenticated: create or update the user's review for a book. */
export const upsertReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const bookId = Number(req.params.bookId);
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5');
    }

    const book = await Book.findByPk(bookId);
    if (!book) throw new ApiError(404, 'Book not found');

    const existing = await Review.findOne({
      where: { bookId, userId: req.user!.id },
    });

    let review;
    if (existing) {
      existing.rating = rating;
      existing.comment = comment ?? existing.comment;
      await existing.save();
      review = existing;
    } else {
      review = await Review.create({
        bookId,
        userId: req.user!.id,
        rating,
        comment: comment || null,
      } as any);
    }

    return res
      .status(existing ? 200 : 201)
      .json(new ApiResponse(existing ? 200 : 201, review, 'Review saved'));
  }
);

/** Authenticated: delete own review (or admin can delete any). */
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const review = await Review.findByPk(Number(req.params.id));
    if (!review) throw new ApiError(404, 'Review not found');

    if (review.userId !== req.user!.id && req.user!.role !== 'admin') {
      throw new ApiError(403, 'Not allowed to delete this review');
    }

    await review.destroy();
    return res.status(200).json(new ApiResponse(200, null, 'Review deleted'));
  }
);
