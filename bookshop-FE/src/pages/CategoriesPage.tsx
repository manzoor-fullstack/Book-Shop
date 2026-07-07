import React, { useEffect, useState } from 'react';
import { FiPlus, FiTag, FiGrid, FiFolder } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { categoryService } from '@/services/category.service';
import type { Category } from '@/types/category.types';
import { formatDateShort } from '@/utils/formatters';

// Deterministic tile color per category id
const TILE_STYLES = [
  'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
];

const AddCategoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}> = ({ isOpen, onClose, onSaved }) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      await categoryService.createCategory({ name: name.trim() });
      toast.success('Category created');
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add category"
      description="Categories help organize your book catalog."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={saving}>
            Create category
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        <Input
          label="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fiction, Science, History"
          autoFocus
        />
      </form>
    </Modal>
  );
};

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    categoryService
      .getCategories()
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <DashboardLayout title="Categories">
      <div className="page-container">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {loading
                ? 'Loading…'
                : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} in your catalog.`}
            </p>
          </div>
          <Button leftIcon={<FiPlus size={16} />} onClick={() => setModalOpen(true)}>
            Add category
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FiGrid size={22} />}
              title="No categories yet"
              description="Create your first category to organize your books and make them easier to find."
              action={
                <Button leftIcon={<FiPlus size={16} />} onClick={() => setModalOpen(true)}>
                  Add category
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat, i) => (
              <Card key={cat.id} hover className="flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-xl ${
                      TILE_STYLES[cat.id % TILE_STYLES.length] || TILE_STYLES[i % TILE_STYLES.length]
                    }`}
                  >
                    <FiTag size={20} />
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400 dark:bg-slate-800">
                    #{cat.id}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                    {cat.name}
                  </h3>
                  {cat.createdAt && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <FiFolder size={12} /> Created {formatDateShort(cat.createdAt)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddCategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
      />
    </DashboardLayout>
  );
};

export default CategoriesPage;
