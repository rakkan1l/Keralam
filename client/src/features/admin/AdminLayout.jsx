import { NavLink, Link, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, MapPin, Store, Utensils, BedDouble, CalendarDays, Map, TrendingUp, Flag, ShieldCheck, Users, BarChart3, Languages, Brain, Siren, TriangleAlert, Bus, Route, Menu, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cx } from '../../utils/format';

export const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/r/places', label: 'Places', icon: MapPin },
  { to: '/admin/r/businesses', label: 'Food & businesses', icon: Store },
  { to: '/admin/r/dishes', label: 'Dishes', icon: Utensils },
  { to: '/admin/r/stays', label: 'Stays', icon: BedDouble },
  { to: '/admin/r/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/r/districts', label: 'Districts', icon: Map },
  { to: '/admin/r/transport', label: 'Transport hubs', icon: Bus },
  { to: '/admin/r/route-stops', label: 'Route stops', icon: Route },
  { to: '/admin/trending', label: 'Trending', icon: TrendingUp },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/moderation', label: 'Community moderation', icon: ShieldCheck },
  { to: '/admin/r/safety-notices', label: 'Safety notices', icon: TriangleAlert, adminOnly: true },
  { to: '/admin/r/emergency-contacts', label: 'Emergency contacts', icon: Siren, adminOnly: true },
  { to: '/admin/r/translations', label: 'Languages', icon: Languages, adminOnly: true },
  { to: '/admin/ai', label: 'AI knowledge', icon: Brain },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
];

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="flex flex-col gap-0.5" aria-label="Admin">
      {ADMIN_NAV.filter((n) => !n.adminOnly || isAdmin).map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => cx('flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm', isActive ? 'bg-forest-800 text-white' : 'text-forest-100 hover:bg-forest-800/60')}>
          <Icon className="size-4" aria-hidden /> {label}
        </NavLink>
      ))}
    </nav>
  );
  return (
    <div className="min-h-dvh bg-sand-100 lg:grid lg:grid-cols-[250px_1fr]">
      <title>Admin · Keralam</title>
      <meta name="robots" content="noindex" />
      <aside className="hidden flex-col gap-6 bg-forest-950 p-4 lg:flex">
        <Link to="/admin" className="flex items-center gap-2 px-2 pt-2"><img src="/favicon.svg" alt="" className="size-8" /><span className="font-display text-lg text-white">Keralam CMS</span></Link>
        {nav}
        <Link to="/" className="mt-auto flex items-center gap-2 px-3 text-sm text-forest-200 hover:text-white"><ArrowLeft className="size-4" aria-hidden />Back to site</Link>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sand-300 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open admin menu"><Menu className="size-5" /></button>
          <span className="text-sm text-muted">Signed in as <strong className="text-ink">{user?.name}</strong> · {user?.role}</span>
          <Link to="/" className="text-sm font-medium text-forest-700 hover:underline">View site</Link>
        </header>
        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-forest-950 p-4">
            <button type="button" onClick={() => setOpen(false)} className="mb-4 text-white" aria-label="Close"><X className="size-5" /></button>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}
