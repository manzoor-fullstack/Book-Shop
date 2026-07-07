import React, { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowLeft,
} from 'react-icons/fi';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { validatePassword } from '@/utils/validation';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!token) return;
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, password: formData.password });
      toast.success('Password reset successful! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      console.error('Reset password failed:', err);
      const message =
        err?.response?.data?.message ||
        'Could not reset your password. The link may have expired.';
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Missing/invalid token — handled gracefully.
  if (!token) {
    return (
      <AuthLayout title="Invalid reset link" subtitle="This link is missing or has expired">
        <div className="space-y-6">
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>
              We couldn&apos;t find a valid reset token. Please request a new password
              reset link.
            </span>
          </div>

          <Link to="/forgot-password">
            <Button type="button" variant="primary" size="lg" fullWidth>
              Request a new link
            </Button>
          </Link>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            <FiArrowLeft size={15} /> Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <Input
          label="New password"
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
          label="Confirm new password"
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
          Reset password
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        <FiArrowLeft size={15} /> Back to sign in
      </Link>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
