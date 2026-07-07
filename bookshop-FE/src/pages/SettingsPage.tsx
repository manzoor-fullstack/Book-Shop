import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSun,
  FiMoon,
  FiMonitor,
  FiBell,
  FiUser,
  FiLock,
  FiChevronRight,
  FiMail,
  FiCheck,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { settingsService, UserSettings } from '@/services/settings.service';
import { useThemeStore, Theme } from '@/store/themeStore';
import { cn } from '@/lib/cn';
import toast from 'react-hot-toast';

/* ---------------- Inline toggle switch ---------------- */
const Switch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}> = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
      'disabled:opacity-50 disabled:pointer-events-none',
      checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
    )}
  >
    <span
      className={cn(
        'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
        checked ? 'translate-x-5' : 'translate-x-0.5'
      )}
    />
  </button>
);

const THEME_OPTIONS: { key: Theme; label: string; icon: React.ReactNode }[] = [
  { key: 'light', label: 'Light', icon: <FiSun size={18} /> },
  { key: 'dark', label: 'Dark', icon: <FiMoon size={18} /> },
  { key: 'system', label: 'System', icon: <FiMonitor size={18} /> },
];

const NOTIFICATIONS: { key: keyof UserSettings; title: string; description: string }[] = [
  {
    key: 'emailNotifications',
    title: 'Email notifications',
    description: 'Receive important account emails from us.',
  },
  {
    key: 'orderUpdates',
    title: 'Order updates',
    description: 'Get notified when your order status changes.',
  },
  {
    key: 'marketingEmails',
    title: 'Marketing emails',
    description: 'News, promotions, and personalized recommendations.',
  },
];

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    settingsService
      .get()
      .then((data) => active && setSettings(data))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const persist = async (patch: Partial<UserSettings>, key: string) => {
    setSavingKey(key);
    try {
      const updated = await settingsService.update(patch);
      setSettings(updated);
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not save settings');
      // reload authoritative state on failure
      settingsService.get().then(setSettings).catch(() => {});
    } finally {
      setSavingKey(null);
    }
  };

  const handleTheme = (t: Theme) => {
    setTheme(t);
    setSettings((prev) => (prev ? { ...prev, theme: t } : prev));
    persist({ theme: t }, `theme:${t}`);
  };

  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    persist({ [key]: value }, key);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="page-container">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your preferences and account.
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : error || !settings ? (
            <Card>
              <EmptyState
                title="Could not load settings"
                description="Please refresh the page and try again."
                action={
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Appearance */}
              <Card>
                <CardHeader title="Appearance" subtitle="Choose how BookShop looks to you." />
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((opt) => {
                    const selected = theme === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleTheme(opt.key)}
                        className={cn(
                          'relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition',
                          selected
                            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700'
                        )}
                      >
                        {selected && (
                          <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-white">
                            <FiCheck size={11} />
                          </span>
                        )}
                        {opt.icon}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader
                  title={
                    <span className="inline-flex items-center gap-2">
                      <FiBell size={16} className="text-slate-400" /> Notifications
                    </span>
                  }
                  subtitle="Control which emails you receive."
                />
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {NOTIFICATIONS.map((n) => (
                    <li key={n.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{n.description}</p>
                      </div>
                      <Switch
                        checked={Boolean(settings[n.key])}
                        disabled={savingKey === n.key}
                        onChange={(v) => handleToggle(n.key, v)}
                        label={n.title}
                      />
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Account */}
              <Card>
                <CardHeader title="Account" subtitle="Manage your profile and security." />
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 py-3.5 first:pt-0 transition hover:opacity-80"
                  >
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      <FiUser size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Profile</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Update your name, photo, and contact details.
                      </p>
                    </div>
                    <FiChevronRight className="text-slate-300 dark:text-slate-600" size={18} />
                  </Link>

                  <div className="flex items-center gap-3 py-3.5 last:pb-0">
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <FiLock size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Password</p>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <FiMail size={13} /> Reset your password via the email link on the login page.
                      </p>
                    </div>
                    <Link to="/login">
                      <Button variant="outline" size="sm">
                        Reset
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
