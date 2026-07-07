import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBook,
  FiShoppingCart,
  FiHeart,
  FiMinus,
  FiPlus,
  FiStar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StarRating } from '@/components/ui/StarRating';
import { bookService } from '@/services/book.service';
import { cartService } from '@/services/cart.service';
import { wishlistService } from '@/services/wishlist.service';
import { reviewService, Review } from '@/services/review.service';
import { formatPrice, formatDateShort } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/types/book.types';

const CoverPlaceholder: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/20 via-violet-500/15 to-sky-500/20 text-brand-500/70 dark:text-brand-300/60">
    <FiBook size={72} />
  </div>
);

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wished, setWished] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = React.useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await reviewService.getForBook(id);
      setReviews(res.reviews || []);
      setAverage(res.average || 0);
      setCount(res.count || 0);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    bookService
      .getBookById(id)
      .then((res) => setBook(res.data.book))
      .catch((err: any) => {
        setNotFound(true);
        toast.error(err?.response?.data?.message || 'Failed to load book');
      })
      .finally(() => setLoading(false));

    wishlistService
      .get()
      .then((items) => setWished(items.some((w: any) => String(w.bookId) === String(id))))
      .catch(() => {});

    loadReviews();
  }, [id, loadReviews]);

  const stock = book ? Number(book.stock) : 0;
  const outOfStock = stock <= 0;

  const handleAddToCart = async () => {
    if (!book) return;
    setAdding(true);
    try {
      await cartService.addToCart({ bookId: book.id, quantity });
      toast.success(`"${book.title}" added to cart`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!book) return;
    const prev = wished;
    setWished(!prev);
    try {
      if (prev) {
        await wishlistService.remove(book.id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.add(book.id);
        toast.success('Added to wishlist');
      }
    } catch (err: any) {
      setWished(prev);
      toast.error(err?.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (ratingInput < 1) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.submit(id, { rating: ratingInput, comment: commentInput.trim() || undefined });
      toast.success('Review submitted');
      setRatingInput(0);
      setCommentInput('');
      await loadReviews();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Book Details">
        <div className="page-container">
          <Skeleton className="mb-6 h-9 w-32 rounded-lg" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3 rounded" />
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-24 w-full rounded" />
              <Skeleton className="h-12 w-48 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !book) {
    return (
      <DashboardLayout title="Book Details">
        <div className="page-container">
          <Card>
            <EmptyState
              icon={<FiBook size={22} />}
              title="Book not found"
              description="This book may have been removed or is unavailable."
              action={
                <Button variant="outline" leftIcon={<FiArrowLeft />} onClick={() => navigate('/browse')}>
                  Back to browse
                </Button>
              }
            />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const categoryName = book.Category?.name || book.category?.name;

  return (
    <DashboardLayout title="Book Details">
      <div className="page-container">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
        >
          <FiArrowLeft size={16} /> Back
        </button>

        {/* Detail */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
          <Card padded={false} className="overflow-hidden self-start">
            <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800">
              {book.image ? (
                <img src={book.image} alt={book.title} className="h-full w-full object-cover" />
              ) : (
                <CoverPlaceholder />
              )}
            </div>
          </Card>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {categoryName && <Badge tone="brand">{categoryName}</Badge>}
              {outOfStock ? (
                <Badge tone="danger" dot>
                  Out of stock
                </Badge>
              ) : stock < 10 ? (
                <Badge tone="warning" dot>
                  Only {stock} left
                </Badge>
              ) : (
                <Badge tone="success" dot>
                  In stock
                </Badge>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {book.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              by {book.author || 'Unknown author'}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <StarRating value={average} size={18} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {average ? average.toFixed(1) : 'No ratings'}{count ? ` · ${count} review${count === 1 ? '' : 's'}` : ''}
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
              {formatPrice(Number(book.price))}
            </p>

            {book.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {book.description}
              </p>
            )}

            {/* Quantity + actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || outOfStock}
                  className="grid h-10 w-10 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FiMinus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
                  disabled={outOfStock || quantity >= stock}
                  className="grid h-10 w-10 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FiPlus size={16} />
                </button>
              </div>

              <Button
                leftIcon={<FiShoppingCart size={16} />}
                disabled={outOfStock}
                isLoading={adding}
                onClick={handleAddToCart}
              >
                {outOfStock ? 'Out of stock' : 'Add to cart'}
              </Button>

              <Button
                variant="outline"
                leftIcon={<FiHeart size={16} className={wished ? 'fill-rose-500 text-rose-500' : ''} />}
                onClick={toggleWishlist}
              >
                {wished ? 'Wishlisted' : 'Wishlist'}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Customer reviews"
              subtitle={count ? `${count} review${count === 1 ? '' : 's'}` : 'No reviews yet'}
              action={
                <div className="flex items-center gap-2">
                  <StarRating value={average} size={16} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {average ? average.toFixed(1) : '—'}
                  </span>
                </div>
              }
            />

            {reviewsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={<FiStar size={22} />}
                title="No reviews yet"
                description="Be the first to share your thoughts on this book."
              />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map((r) => {
                  const name = r.User ? `${r.User.firstName} ${r.User.lastName}` : 'Anonymous';
                  return (
                    <li key={r.id} className="flex gap-3 py-4 first:pt-0">
                      <Avatar src={r.User?.profileImage} name={name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {name}
                          </p>
                          <span className="text-xs text-slate-400">
                            {formatDateShort(r.createdAt)}
                          </span>
                        </div>
                        <div className="mt-0.5">
                          <StarRating value={r.rating} size={14} />
                        </div>
                        {r.comment && (
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {r.comment}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Write a review */}
          <Card className="self-start">
            <CardHeader title="Write a review" subtitle="Share your experience" />
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Your rating
                </label>
                <StarRating value={ratingInput} size={26} onChange={setRatingInput} />
              </div>
              <Textarea
                label="Comment"
                placeholder="What did you think of this book?"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <Button type="submit" fullWidth isLoading={submitting} disabled={!user}>
                Submit review
              </Button>
              {!user && (
                <p className="text-center text-xs text-slate-400">
                  <Link to="/login" className="text-brand-600 hover:underline">
                    Sign in
                  </Link>{' '}
                  to leave a review.
                </p>
              )}
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookDetailPage;
