import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '@/store/themeStore';

export const ThemeToggle: React.FC = () => {
  const { toggle } = useThemeStore();
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
    >
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;
