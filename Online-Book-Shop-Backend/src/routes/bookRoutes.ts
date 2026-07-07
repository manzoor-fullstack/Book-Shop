import express from 'express';
import {
  addBook,
  fetchBooks,
  fetchBookById,
  editBook,
  removeBook
} from '../controllers/bookController';
import { protect } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/adminMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management APIs
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, author, or category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Books fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/', protect, fetchBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book fetched successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, fetchBookById);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add new book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Book title (required)
 *               author:
 *                 type: string
 *                 description: Author name (optional, default "Unknown")
 *               description:
 *                 type: string
 *                 description: Book description (optional)
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Book price (required)
 *               stock:
 *                 type: integer
 *                 description: Book stock quantity (optional, default 0)
 *               categoryId:
 *                 type: integer
 *                 description: Category ID (required)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Book image file (optional)
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', protect, isAdmin, upload.single('image'), addBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Book title (optional)
 *               author:
 *                 type: string
 *                 description: Author name (optional)
 *               description:
 *                 type: string
 *                 description: Book description (optional)
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Book price (optional)
 *               stock:
 *                 type: integer
 *                 description: Book stock quantity (optional)
 *               categoryId:
 *                 type: integer
 *                 description: Category ID (optional)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Book image file (optional)
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, isAdmin, upload.single('image'), editBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID to delete
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, isAdmin, removeBook);

export default router;