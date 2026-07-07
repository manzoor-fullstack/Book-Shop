import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiEdit2,
  FiSave,
  FiX,
  FiCamera,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTrash2,
  FiAlertTriangle,
  FiCalendar,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const emptyForm = (user: any) => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  phone: user?.phone || '',
  address: user?.address || '',
});

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm(user));
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  const startEdit = () => {
    setForm(emptyForm(user));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm(emptyForm(user));
    setProfileImage(null);
    setPreview(null);
    setIsEditing(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
      };
      if (profileImage) payload.profileImage = profileImage;

      const res = await authService.updateProfile(payload);
      const updatedUser = res?.data?.data?.user || res?.data?.user;
      if (updatedUser) setUser(updatedUser);
      toast.success('Profile updated');
      setIsEditing(false);
      setProfileImage(null);
      setPreview(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await authService.deleteAccount();
      toast.success('Your account has been deleted');
      await logout();
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const avatarSrc = preview || user?.profileImage || null;

  return (
    <DashboardLayout title="Profile">
      <div className="page-container">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal information and account.
            </p>
          </div>

          {/* Header card */}
          <Card className="mb-6 overflow-hidden !p-0">
            <div className="h-24 bg-gradient-to-r from-brand-600 to-violet-600" />
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <Avatar src={avatarSrc} name={fullName} size="lg" className="!h-20 !w-20 !ring-4" />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white shadow-sm transition hover:bg-brand-700"
                        aria-label="Change photo"
                      >
                        <FiCamera size={15} />
                      </button>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {fullName || 'Your name'}
                      </h2>
                      <Badge tone={user?.role === 'admin' ? 'purple' : 'brand'}>
                        {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <FiMail size={14} /> {user?.email}
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <Button variant="outline" leftIcon={<FiEdit2 size={15} />} onClick={startEdit}>
                    Edit profile
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card className="mb-6">
            <form onSubmit={handleSave}>
              <CardHeader
                title="Personal information"
                action={
                  isEditing ? (
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" leftIcon={<FiX size={15} />} onClick={cancelEdit} disabled={saving}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" leftIcon={<FiSave size={15} />} isLoading={saving}>
                        Save
                      </Button>
                    </div>
                  ) : undefined
                }
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {isEditing ? (
                  <>
                    <Input
                      label="First name"
                      name="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                    <Input
                      label="Last name"
                      name="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                    <Input
                      label="Email"
                      value={user?.email || ''}
                      disabled
                      hint="Email cannot be changed"
                    />
                    <Input
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      leftIcon={<FiPhone size={15} />}
                    />
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Address"
                        name="address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Field label="First name" value={user?.firstName} />
                    <Field label="Last name" value={user?.lastName} />
                    <Field label="Email" value={user?.email} icon={<FiMail size={14} />} />
                    <Field label="Phone" value={user?.phone} icon={<FiPhone size={14} />} />
                    <div className="sm:col-span-2">
                      <Field label="Address" value={user?.address} icon={<FiMapPin size={14} />} />
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-2">
                  <Field
                    label="Member since"
                    value={user?.createdAt ? formatDate(user.createdAt) : '—'}
                    icon={<FiCalendar size={14} />}
                  />
                  <Field
                    label="Last updated"
                    value={user?.updatedAt ? formatDate(user.updatedAt) : '—'}
                    icon={<FiCalendar size={14} />}
                  />
                </div>
              )}
            </form>
          </Card>

          {/* Danger zone */}
          <Card className="border-rose-200 dark:border-rose-500/20">
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <FiAlertTriangle size={18} /> Danger zone
                </span>
              }
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Delete account</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Permanently remove your account and all associated data. This cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                leftIcon={<FiTrash2 size={15} />}
                onClick={() => setConfirmDelete(true)}
                className="flex-shrink-0"
              >
                Delete account
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete your account?"
        message="This will permanently delete your account, orders history access, and wishlist. This action cannot be undone."
        confirmText="Delete account"
        type="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </DashboardLayout>
  );
};

const Field: React.FC<{ label: string; value?: string | null; icon?: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
      {icon && <span className="text-slate-400">{icon}</span>}
      {value || <span className="text-slate-400">Not provided</span>}
    </p>
  </div>
);

export default ProfilePage;
