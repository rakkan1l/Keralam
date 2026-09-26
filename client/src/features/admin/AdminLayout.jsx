import { NavLink, Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Store, Utensils, BedDouble, CalendarDays, Map, TrendingUp, Flag, ShieldCheck, Users, BarChart3,
  Languages, Brain, Siren, TriangleAlert, Bus, Route, Menu, X, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cx } from '../../utils/format';

export const ADMIN_NAV = [
  { label: null, items: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true }] },
  {
    label: 'Content',
    items: [
      { to: '/admin/r/places', label: 'Places', icon: MapPin },
      { to: '/admin/r/businesses', label: 'Food & businesses', icon: Store },
      { to: '/admin/r/dishes', label: 'Dishes', icon: Utensils },
      { to: '/admin/r/stays', label: 'Stays', icon: BedDouble },
      { to: '/admin/r/events', label: 'Events', icon: CalendarDays },
      { to: '/admin/r/districts', label: 'Districts', icon: Map },
      { to: '/admin/r/transport', label: 'Transport hubs', icon: Bus },
      { to: '/admin/r/route-stops', label: 'Route stops', icon: Route },
    ],
  },
  {
    label: 'Community & insight',
    items: [
      { to: '/admin/trending', label: 'Trending', icon: TrendingUp },
      { to: '/admin/reports', label: 'Reports', icon: Flag },
      { to: '/admin/moderation', label: 'Moderation', icon: ShieldCheck },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/admin/r/safety-notices', label: 'Safety notices', icon: TriangleAlert, adminOnly: true },
      { to: '/admin/r/emergency-contacts', label: 'Emergency contacts', icon: Siren, adminOnly: true },
      { to: '/admin/r/translations', label: 'Languages', icon: Languages, adminOnly: true },
      { to: '/admin/ai', label: 'AI knowledge', icon: Brain },
      { to: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
    ],
  },
];

function SideNav({ isAdmin }) {
  return (
    <nav className="flex flex-col gap-6" aria-label="Admin">
      {ADMIN_NAV.map((group) => (
        <div key={group.label || 'main'}>
          {group.label && <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">{group.label}</p>}
          <ul className="space-y-0.5">
            {group.items.filter((n) => !n.adminOnly || isAdmin).map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => cx('flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors', isActive ? 'bg-forest-50 font-medium text-forest-800' : 'text-ink-soft hover:bg-sand-100 hover:text-ink')}>
                  <Icon className="size-4" aria-hidden /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className="min-h-dvh bg-sand-100 lg:grid lg:grid-cols-[240px_1fr]">
      <title>Admin · Keralam</title>
      <meta name="robots" content="noindex" />
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 overflow-y-auto border-r border-line bg-white px-3 py-5 lg:flex">
        <Link to="/admin" className="flex items-center gap-2 px-3">
          <span className="grid size-7 place-items-center rounded-lg bg-forest-800 text-xs font-semibold text-white">K</span>
          <span className="text-[15px] font-semibold">Keralam <span className="font-normal text-muted">CMS</span></span>
        </Link>
        <SideNav isAdmin={isAdmin} />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-line bg-white/90 px-4 backdrop-blur lg:px-8">
          <button type="button" className="grid size-9 place-items-center rounded-lg hover:bg-sand-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open admin menu"><Menu className="size-5" /></button>
          <span className="truncate text-sm text-muted">{user?.name} · <span className="capitalize">{user?.role}</span></span>
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-forest-700">View site <ArrowUpRight className="size-3.5" aria-hidden /></Link>
        </header>
        <main className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-forest-950/35" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white p-4">
            <button type="button" onClick={() => setOpen(false)} className="mb-4 grid size-9 place-items-center rounded-lg hover:bg-sand-100" aria-label="Close"><X className="size-5" /></button>
            <SideNav isAdmin={isAdmin} />
          </div>
        </div>
      )}
    </div>
  );
}
