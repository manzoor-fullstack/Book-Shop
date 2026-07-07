import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { validateEmail } from '@/utils/validation';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      // In mock/dev mode the API surfaces the reset token so the flow is testable.
      const token = response?.data?.resetToken as string | undefined;
      if (token) setResetToken(token);
      setSent(true);
      toast.success('Reset instructions sent');
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      const message =
        err?.response?.data?.message || 'Could not send reset instructions. Please try again.';
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent reset instructions to ${email}`}>
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FiCheckCircle size={26} />
            </span>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              If an account exists for <span className="font-medium text-slate-800 dark:text-slate-200">{email}</span>,
              you&apos;ll receive an email with a link to reset your password. It may take a
              few minutes to arrive.
            </p>
          </div>

          {resetToken && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Dev mode: a reset token was generated. Continue directly to reset your
                password.
              </p>
              <Button
                type="button"
                variant="primary"
                fullWidth
                className="mt-3"
                rightIcon={<FiArrowRight size={16} />}
                onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}
              >
                Continue to reset
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => {
                setSent(false);
                setResetToken(null);
              }}
            >
              Use a different email
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <FiArrowLeft size={15} /> Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          placeholder="you@example.com"
          leftIcon={<FiMail size={16} />}
          error={error}
          autoComplete="email"
          required
        />

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} fullWidth>
          Send reset link
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

export default ForgotPasswordPage;
