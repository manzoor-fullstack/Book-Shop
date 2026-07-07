import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUser, FiShield } from 'react-icons/fi';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { validateEmail } from '@/utils/validation';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@bookshop.com',
    password: 'Admin@123',
    icon: FiShield,
    tone: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10',
  },
  {
    role: 'Customer',
    email: 'customer@bookshop.com',
    password: 'Customer@123',
    icon: FiUser,
    tone: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const fillDemo = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your dashboard">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

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
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          leftIcon={<FiLock size={16} />}
          error={errors.password}
          autoComplete="current-password"
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

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/40 dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} fullWidth>
          Sign in
        </Button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Demo accounts — click to fill
        </p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40 dark:hover:bg-slate-800"
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${acc.tone}`}>
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                    {acc.role}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {acc.email} · {acc.password}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
