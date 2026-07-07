import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { createBook, getBooks, getBookById, updateBook, deleteBook } from '../services/bookService';
import { uploadOnCloudinary } from '../utils/cloudinary';

export const addBook = asyncHandler(async (req: Request, res: Response) => {
  const response = await createBook({
    ...req.body,
    image: req.file?.buffer, // ✅ IMPORTANT
  });

  res.status(response.statusCode).json(response);
});

export const fetchBooks = asyncHandler(async (req: Request, res: Response) => {
  const books = await getBooks(req.query);
  res.json(books);
});

export const fetchBookById = asyncHandler(
  async (req: Request, res: Response) => {
    const book = await getBookById(Number(req.params.id));
    res.json(book);
  }
);

export const editBook = asyncHandler(async (req: any, res: Response) => {
  let imageUrl;

  if (req.file) {
    const result = await uploadOnCloudinary(req.file.buffer);
    imageUrl = result.secure_url;
  }

  const book = await updateBook(Number(req.params.id), {
    ...req.body,
    ...(imageUrl && { image: imageUrl }),
  });

  res.json(book);
});

// Delete book
export const removeBook = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteBook(Number(req.params.id));
  res.json(result);
});