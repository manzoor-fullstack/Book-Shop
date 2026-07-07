import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiCheck, FiStar } from 'react-icons/fi';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const FEATURES = [
  'Manage your entire catalog in one place',
  'Real-time inventory & order tracking',
  'Beautiful analytics that actually help',
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left brand panel — hidden on mobile */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[45%] overflow-hidden bg-gradient-to-br from-brand-600 to-violet-600 text-white">
        {/* decorative blobs */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-violet-400/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 w-fit">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/20">
              <FiBook size={22} />
            </span>
            <span className="text-xl font-bold tracking-tight">BookShop</span>
          </Link>

          {/* Headline + features */}
          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              The operating system for modern bookstores.
            </h2>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              Everything you need to run your shop — inventory, orders, customers, and
              insights — in one refined workspace.
            </p>

            <ul className="mt-8 space-y-4">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
                    <FiCheck size={14} />
                  </span>
                  <span className="text-sm text-white/90">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial */}
          <figure className="max-w-md rounded-2xl bg-white/10 p-5 backdrop-blur ring-1 ring-white/15">
            <div className="flex gap-0.5 text-amber-300" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} size={14} className="fill-current" />
              ))}
            </div>
            <blockquote className="mt-3 text-sm text-white/90 leading-relaxed">
              “We switched our whole store over in a weekend. Orders that used to take
              minutes now take seconds. It just feels premium.”
            </blockquote>
            <figcaption className="mt-3 text-xs font-medium text-white/70">
              Amara Okafor · Owner, Chapter &amp; Verse
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Right panel — form card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white">
              <FiBook size={20} />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              BookShop
            </span>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
