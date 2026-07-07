import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiLogOut, FiUser, FiSettings, FiCheck } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { notificationService, AppNotification } from '@/services/notification.service';
import { cn } from '@/lib/cn';

const useClickOutside = (onClose: () => void) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return ref;
};

const timeAgo = (date: string) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const ref = useClickOutside(() => setOpen(false));

  const load = async () => {
    try {
      const data = await notificationService.list();
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const markAll = async () => {
    await notificationService.markAllRead();
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
      >
        <FiBell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card p-0 shadow-pop animate-scale-in origin-top-right z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                <FiCheck size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (n.link) navigate(n.link);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition',
                    !n.isRead && 'bg-brand-50/40 dark:bg-brand-500/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
                    <div className={cn(!n.isRead ? '' : 'pl-4')}>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const ref = useClickOutside(() => setOpen(false));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
        <Avatar src={user?.profileImage} name={fullName} size="sm" />
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.firstName}</p>
          <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 card p-1.5 shadow-pop animate-scale-in origin-top-right z-50">
          <div className="px-3 py-2.5 border-b border-slate-200/70 dark:border-slate-800 mb-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{fullName || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button onClick={() => { navigate('/profile'); setOpen(false); }} className="menu-item">
            <FiUser size={16} /> Profile
          </button>
          <button onClick={() => { navigate('/settings'); setOpen(false); }} className="menu-item">
            <FiSettings size={16} /> Settings
          </button>
          <div className="my-1 border-t border-slate-200/70 dark:border-slate-800" />
          <button onClick={handleLogout} className="menu-item text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10">
            <FiLogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
};

export const Topbar: React.FC<{ title?: string; onMenuClick: () => void }> = ({ title, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200/70 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <FiMenu size={20} />
        </button>
        {title && <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>}
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationBell />
        <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Topbar;
