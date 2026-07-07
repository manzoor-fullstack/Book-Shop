import React, { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCamera,
  FiX,
} from 'react-icons/fi';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateName(formData.firstName)) {
      newErrors.firstName = 'First name must be at least 2 characters long';
    }

    if (!validateName(formData.lastName)) {
      newErrors.lastName = 'Last name must be at least 2 characters long';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        profileImage: profileImage || undefined,
      });
      toast.success('Registration successful! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error('Registration failed. Please try again.');
    }
  };

  const initials =
    (formData.firstName?.[0] || '') + (formData.lastName?.[0] || '');

  return (
    <AuthLayout title="Create your account" subtitle="Join the community of book lovers">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <label
              htmlFor="profileImage"
              className="group grid h-16 w-16 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : initials.trim() ? (
                <span className="text-lg font-semibold uppercase text-slate-500 dark:text-slate-300">
                  {initials}
                </span>
              ) : (
                <FiCamera size={20} className="transition-colors group-hover:text-brand-500" />
              )}
            </label>
            {previewUrl && (
              <button
                type="button"
                onClick={() => setProfileImage(null)}
                className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white shadow-sm transition-colors hover:bg-rose-600"
                aria-label="Remove image"
              >
                <FiX size={13} />
              </button>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Profile photo
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optional · PNG or JPG
            </p>
            <label
              htmlFor="profileImage"
              className="mt-1.5 inline-block cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {profileImage ? 'Change photo' : 'Upload photo'}
            </label>
          </div>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="First name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            leftIcon={<FiUser size={16} />}
            error={errors.firstName}
            autoComplete="given-name"
            required
          />
          <Input
            label="Last name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            error={errors.lastName}
            autoComplete="family-name"
            required
          />
        </div>

        <Input
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          leftIcon={<FiMail size={16} />}
          error={errors.email}
          autoComplete="email"
          required
        />

        <Input
          label="Phone number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 234 567 890"
          leftIcon={<FiPhone size={16} />}
          error={errors.phone}
          autoComplete="tel"
          required
        />

        <Textarea
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main St, City, State, ZIP"
          rows={3}
          error={errors.address}
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          leftIcon={<FiLock size={16} />}
          error={errors.password}
          hint={!errors.password ? 'At least 8 chars, with upper, lower & number' : undefined}
          autoComplete="new-password"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
        />

        <Input
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          leftIcon={<FiLock size={16} />}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
        />

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} fullWidth>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
