import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiBook,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiTag,
  FiUsers,
  FiBarChart2,
  FiUser,
  FiSettings,
  FiX,
} from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}
interface NavSection {
  title?: string;
  items: NavItem[];
}

const iconCls = 'text-[18px] shrink-0';

const adminNav: NavSection[] = [
  {
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: <FiGrid className={iconCls} /> },
      { name: 'Analytics', path: '/analytics', icon: <FiBarChart2 className={iconCls} /> },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { name: 'Products', path: '/books', icon: <FiBook className={iconCls} /> },
      { name: 'Categories', path: '/categories', icon: <FiTag className={iconCls} /> },
    ],
  },
  {
    title: 'Sales',
    items: [
      { name: 'Orders', path: '/orders', icon: <FiShoppingBag className={iconCls} /> },
      { name: 'Customers', path: '/customers', icon: <FiUsers className={iconCls} /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { name: 'Profile', path: '/profile', icon: <FiUser className={iconCls} /> },
      { name: 'Settings', path: '/settings', icon: <FiSettings className={iconCls} /> },
    ],
  },
];

const userNav: NavSection[] = [
  {
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: <FiGrid className={iconCls} /> },
      { name: 'Browse Books', path: '/browse', icon: <FiBook className={iconCls} /> },
      { name: 'Wishlist', path: '/wishlist', icon: <FiHeart className={iconCls} /> },
    ],
  },
  {
    title: 'Orders',
    items: [
      { name: 'My Cart', path: '/cart', icon: <FiShoppingCart className={iconCls} /> },
      { name: 'My Orders', path: '/my-orders', icon: <FiShoppingBag className={iconCls} /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { name: 'Profile', path: '/profile', icon: <FiUser className={iconCls} /> },
      { name: 'Settings', path: '/settings', icon: <FiSettings className={iconCls} /> },
    ],
  },
];

export const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const sections = user?.role === 'admin' ? adminNav : userNav;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed z-40 inset-y-0 left-0 w-64 bg-ink-900 text-slate-300 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <FiBook size={18} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">BookShop</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                {user?.role === 'admin' ? 'Admin Console' : 'Store'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section, i) => (
            <div key={i}>
              {section.title && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )
                      }
                    >
                      {item.icon}
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer badge */}
        <div className="p-3 border-t border-white/5">
          <div className="rounded-xl bg-white/5 px-3 py-2.5 text-xs text-slate-400">
            <p className="font-semibold text-slate-200">BookShop v2.0</p>
            <p>Inventory & Store Suite</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
