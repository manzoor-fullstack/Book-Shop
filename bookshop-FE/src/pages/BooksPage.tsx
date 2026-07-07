import React, { useEffect, useMemo, useState } from 'react';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBook,
  FiUploadCloud,
  FiImage,
  FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { bookService } from '@/services/book.service';
import { categoryService } from '@/services/category.service';
import type { Book } from '@/types/book.types';
import type { Category } from '@/types/category.types';
import { formatPrice, formatNumber } from '@/utils/formatters';

const PAGE_SIZE = 10;

const priceOf = (p: number | string) =>
  typeof p === 'string' ? parseFloat(p) : p;

const stockTone = (stock: number): 'success' | 'warning' | 'danger' => {
  if (stock === 0) return 'danger';
  if (stock <= 10) return 'warning';
  return 'success';
};

interface BookFormState {
  title: string;
  author: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
}

const emptyForm: BookFormState = {
  title: '',
  author: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
};

/* ---------------- Book form modal ---------------- */
const BookFormModal: React.FC<{
  isOpen: boolean;
  book: Book | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ isOpen, book, categories, onClose, onSaved }) => {
  const isEdit = !!book;
  const [form, setForm] = useState<BookFormState>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        price: String(priceOf(book.price) ?? ''),
        stock: String(book.stock ?? ''),
        categoryId: String(book.categoryId ?? book.Category?.id ?? ''),
      });
      setPreview(book.image || null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
    setImage(null);
  }, [isOpen, book]);

  const update = (k: keyof BookFormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.categoryId) return toast.error('Please select a category');
    if (!form.price || isNaN(parseFloat(form.price)))
      return toast.error('Enter a valid price');

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim() || undefined,
        description: form.description.trim() || undefined,
        price: parseFloat(form.price),
        stock: form.stock ? parseInt(form.stock, 10) : 0,
        categoryId: parseInt(form.categoryId, 10),
        image: image || undefined,
      };
      if (isEdit && book) await bookService.updateBook(book.id, payload);
      else await bookService.createBook(payload);
      toast.success(isEdit ? 'Book updated' : 'Book created');
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error(isEdit ? 'Failed to update book' : 'Failed to create book');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit book' : 'Add new book'}
      description={isEdit ? 'Update the product details below.' : 'Fill in the details to add a product.'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={saving} form="book-form" type="submit">
            {isEdit ? 'Save changes' : 'Create book'}
          </Button>
        </>
      }
    >
      <form id="book-form" onSubmit={submit} className="space-y-4">
        {categories.length === 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <FiAlertTriangle className="mt-0.5 shrink-0" />
            <span>Create a category first before adding books.</span>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-3">
            <div className="grid h-40 w-32 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              {preview ? (
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <FiImage className="text-slate-300 dark:text-slate-600" size={32} />
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline">
              <FiUploadCloud size={14} />
              {preview ? 'Change cover' : 'Upload cover'}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
          </div>

          <div className="flex-1 space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Book title"
              required
            />
            <Input
              label="Author"
              value={form.author}
              onChange={(e) => update('author', e.target.value)}
              placeholder="Author name"
            />
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Short description of the book"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price ($)"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="0.00"
            required
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => update('stock', e.target.value)}
            placeholder="0"
          />
        </div>
      </form>
    </Modal>
  );
};

/* ---------------- Skeleton rows ---------------- */
const RowSkeletons: React.FC = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-9 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </td>
        <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-14 rounded" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-12 rounded" /></td>
        <td className="px-4 py-3"><Skeleton className="ml-auto h-7 w-16 rounded" /></td>
      </tr>
    ))}
  </>
);

/* ---------------- Page ---------------- */
export const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  const loadBooks = () => {
    setLoading(true);
    bookService
      .getBooks({
        search: debounced || undefined,
        page,
        limit: PAGE_SIZE,
        category: categoryFilter || undefined,
      })
      .then((res) => {
        setBooks(res.data.rows || []);
        setCount(res.data.count || 0);
      })
      .catch(() => toast.error('Failed to load books'))
      .finally(() => setLoading(false));
  };

  useEffect(loadBooks, [debounced, page, categoryFilter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (b: Book) => {
    setEditing(b);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bookService.deleteBook(deleteTarget.id);
      toast.success('Book deleted');
      setDeleteTarget(null);
      // If we deleted the last item on a page, step back
      if (books.length === 1 && page > 1) setPage((p) => p - 1);
      else loadBooks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete book');
    } finally {
      setDeleting(false);
    }
  };

  const showingRange = useMemo(() => {
    if (count === 0) return '0';
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, count);
    return `${start}–${end}`;
  }, [page, count]);

  return (
    <DashboardLayout title="Products">
      <div className="page-container">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your book catalog, stock and pricing.
            </p>
          </div>
          <Button leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add book
          </Button>
        </div>

        <Card padded={false}>
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="sm:max-w-xs sm:flex-1">
              <Input
                leftIcon={<FiSearch size={16} />}
                placeholder="Search books…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:w-52">
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="hidden text-sm text-slate-400 sm:ml-auto sm:block">
              {loading ? '…' : `${showingRange} of ${formatNumber(count)}`}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-medium">Book</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <RowSkeletons />
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={<FiBook size={22} />}
                        title="No books found"
                        description={
                          debounced || categoryFilter
                            ? 'Try adjusting your search or filter.'
                            : 'Add your first product to get started.'
                        }
                        action={
                          !debounced && !categoryFilter ? (
                            <Button leftIcon={<FiPlus size={16} />} onClick={openCreate}>
                              Add book
                            </Button>
                          ) : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  books.map((b) => (
                    <tr
                      key={b.id}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {b.image ? (
                            <img
                              src={b.image}
                              alt=""
                              className="h-12 w-9 shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                          ) : (
                            <div className="grid h-12 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800">
                              <FiBook size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                              {b.title}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {b.author || 'Unknown author'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="brand">
                          {b.Category?.name || b.category?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(priceOf(b.price))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={stockTone(b.stock)} dot>
                          {b.stock === 0 ? 'Out of stock' : `${b.stock} in stock`}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-60 transition group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(b)}
                            title="Edit"
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(b)}
                            title="Delete"
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && books.length > 0 && totalPages > 1 && (
            <div className="border-t border-slate-200/70 p-4 dark:border-slate-800">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <BookFormModal
        isOpen={modalOpen}
        book={editing}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          loadBooks();
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete book"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default BooksPage;
