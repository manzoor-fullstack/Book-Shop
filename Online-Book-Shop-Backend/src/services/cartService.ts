import Cart from '../models/Cart.models';
import CartItem from '../models/CartItem.models';
import Book from '../models/Book.models';
import ApiError from '../utils/apiError';

export const getOrCreateCart = async (userId: number) => {
  let cart = await Cart.findOne({ where: { userId } });

  if (!cart) {
    cart = await Cart.create({ userId });
  }

  return cart;
};

export const addToCart = async (
  userId: number,
  bookId: number,
  quantity: number
) => {
  if (!bookId || quantity <= 0) {
    throw new ApiError(400, 'Invalid bookId or quantity');
  }

  const book = await Book.findByPk(bookId);
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await CartItem.findOne({
    where: { cartId: cart.id, bookId },
  });

  if (existingItem) {
    existingItem.quantity += quantity;
    await existingItem.save();
  } else {
    await CartItem.create({
      cartId: cart.id,
      bookId,
      quantity,
    });
  }

  return null; // response handled in controller
};

export const getCart = async (userId: number) => {
  const cart = await getOrCreateCart(userId);

  const items = await CartItem.findAll({
    where: { cartId: cart.id },
    include: [Book],
  });

  return items;
};

// update Cart item
export const updateCartItem = async (
  userId: number,
  itemId: number,
  quantity: number
) => {
  if (quantity <= 0) {
    throw new ApiError(400, 'Quantity must be greater than 0');
  }

  const cart = await getOrCreateCart(userId);

  const item = await CartItem.findOne({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) {
    throw new ApiError(404, 'Cart item not found or unauthorized');
  }

  item.quantity = quantity;
  await item.save();

  return item;
};

export const removeCartItem = async (
  userId: number,
  itemId: number
) => {
  const cart = await getOrCreateCart(userId);

  const item = await CartItem.findOne({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) {
    throw new ApiError(404, 'Cart item not found or unauthorized');
  }

  await item.destroy();

  return null;
};