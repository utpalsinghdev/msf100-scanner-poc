import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Fingerprint,
  Home,
  Layers,
  LogOut,
  Download,
  Users,
  UserCog,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { SessionUser } from '@/types/auth';

export default function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = hasRole('MasterAdmin')
    ? [
        { to: '/', label: 'Dashboard', icon: Home },
        { to: '/users', label: 'Users', icon: UserCog },
      ]
    : [
        { to: '/', label: 'Dashboard', icon: Home },
        { to: '/batch', label: 'Batches', icon: Layers },
        { to: '/student', label: 'Students', icon: Users },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-6 pt-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
          <Fingerprint className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">BioScan</p>
          <p className="text-xs text-indigo-200">Fingerprint Admin</p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-indigo-900/20'
                  : 'text-indigo-100/80 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <SidebarFooter user={user} onLogout={handleLogout} />
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="gradient-sidebar hidden w-72 flex-col lg:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="gradient-sidebar relative z-10 flex h-full w-72 flex-col shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-white/80 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-8">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-1 items-center justify-end gap-4">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Signed in as
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {user?.name}{' '}
                  <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {user?.role}
                  </span>
                </p>
              </div>
              <a
                href="/MFS100Driver_9.1.1.0andClientService9.0.3.8.zip"
                download
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Scanner drivers</span>
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarFooter({
  user,
  onLogout,
}: {
  user: SessionUser | null;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-white/10 p-4">
      <div className="mb-3 rounded-xl bg-white/10 px-4 py-3 lg:hidden">
        <p className="text-sm font-semibold text-white">{user?.name}</p>
        <p className="text-xs text-indigo-200">{user?.email}</p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
