import { Op } from 'sequelize';
import { Book, Category } from '../models';
import redis from '../config/redis';
import ApiError from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { uploadOnCloudinary } from '../utils/cloudinary';

// 🔥 helper for safe redis delete with pattern
const clearBooksCache = async () => {
  if (!redis) return;

  try {
    const keys = await redis.keys('books:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch {}
};

// ✅ CREATE BOOK
export const createBook = async (data: any) => {
  const {
    title,
    author,
    description,
    price,
    stock,
    categoryId,
    image, // buffer from multer
  } = data;

  // ✅ Validate required fields
  if (!title || !price || !categoryId) {
    throw new ApiError(400, "Title, price and category are required");
  }

  let imageUrl: string | undefined;

  // ✅ Upload image (if exists)
  if (image) {
    try {
      const uploadResult = await uploadOnCloudinary(image, {
        folder: 'books',
        width: 600,
        height: 800,
      });

      imageUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Book Image Upload Failed:", error);
      throw new ApiError(500, "Book image upload failed");
    }
  }

  // ✅ Create book
  const book = await Book.create({
    title,
    author,
    description,
    price,
    stock,
    categoryId,
    image: imageUrl,
  });

  return new ApiResponse(
    201,
    { book },
    "Book created successfully"
  );
};

// ✅ GET BOOKS
export const getBooks = async (query: any) => {
  const {
    search = '',
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
  } = query;

  const cacheKey = `books:${search}:${page}:${limit}:${category}:${minPrice}:${maxPrice}`;

  // ✅ GET CACHE (safe)
  let cache = null;
  if (redis) {
    try {
      cache = await redis.get(cacheKey);
    } catch {}
  }

  if (cache) {
    return new ApiResponse(200, JSON.parse(cache), "Books fetched (cache)");
  }

  const where: any = {};

  if (search) {
    where.title = { [Op.like]: `%${search}%` };
  }

  if (category) {
    where.categoryId = category;
  }

  if (minPrice && maxPrice) {
    where.price = {
      [Op.between]: [minPrice, maxPrice],
    };
  }

  const books = await Book.findAndCountAll({
    where,
    include: [{ model: Category }],
    limit: +limit,
    offset: (page - 1) * limit,
  });

  // ✅ SET CACHE (safe)
  if (redis) {
    try {
      await redis.set(cacheKey, JSON.stringify(books), 'EX', 60);
    } catch {}
  }

  return new ApiResponse(200, books, "Books fetched successfully");
};

// ✅ GET SINGLE BOOK
export const getBookById = async (id: number) => {
  const book = await Book.findByPk(id, {
    include: [Category],
  });

  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  return new ApiResponse(200, { book }, "Book fetched successfully");
};

export const updateBook = async (id: number, data: any) => {
  const book = await Book.findByPk(id);

  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  // Only update fields that are defined
  const fields = ["title", "author", "description", "price", "stock", "categoryId", "image"] as const;

   // Filter only defined fields
  const updateData: Partial<typeof data> = {};
  for (const field of fields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  // ✅ Validate types
  if (updateData.price && isNaN(Number(updateData.price))) {
    throw new ApiError(400, "Price must be a number");
  }

  if (updateData.stock && !Number.isInteger(Number(updateData.stock))) {
    throw new ApiError(400, "Stock must be an integer");
  }

  // ✅ Validate foreign key
  if (updateData.categoryId) {
    const category = await Category.findByPk(updateData.categoryId);
    if (!category) throw new ApiError(400, "Category not found");
  }

  // Update only filtered data
  await book.update(updateData);

  await clearBooksCache();

  return new ApiResponse(200, { book }, "Book updated successfully");
};

// ✅ DELETE BOOK
export const deleteBook = async (id: number) => {
  const book = await Book.findByPk(id);

  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  await book.destroy();

  await clearBooksCache(); // ✅ consistent

  return new ApiResponse(200, null, "Book deleted successfully");
};