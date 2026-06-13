import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Receipt, PiggyBank, BarChart3, MessageCircle,
  LogOut, Wallet, Menu, Bell, Settings, Sun, Moon,
  ChevronDown, AlertTriangle, CheckCircle, X,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '@/services/api';
import { AlertItem } from '@/types';

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [{ path: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard }],
  },
  {
    label: 'Quản lý',
    items: [
      { path: '/transactions', label: 'Giao dịch', icon: Receipt },
      { path: '/budgets', label: 'Ngân sách', icon: PiggyBank },
      { path: '/reports', label: 'Báo cáo', icon: BarChart3 },
    ],
  },
  {
    label: 'Trợ lý AI',
    items: [{ path: '/chatbot', label: 'Tư vấn AI', icon: MessageCircle }],
  },
];

// ── Notification dropdown ──────────────────────────────────────────────────
function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadAlerts = useCallback(() => {
    api.getAlerts(true)
      .then((data) => setAlerts(Array.isArray(data) ? (data as AlertItem[]) : []))
      .catch(() => {});
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: number) => {
    await api.markAlertRead(id).catch(() => {});
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const unreadCount = alerts.length;

  const severityIcon = (severity: string) => {
    if (severity === 'high') return <AlertTriangle className="w-4 h-4 text-semantic-error flex-shrink-0" />;
    if (severity === 'medium') return <AlertTriangle className="w-4 h-4 text-semantic-warning flex-shrink-0" />;
    return <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-gray-dark hover:text-charcoal rounded-standard hover:bg-offwhite-1 transition-colors"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-semantic-error text-white text-[10px] font-bold rounded-pill flex items-center justify-center px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-card shadow-high border border-gray-border z-50 overflow-hidden animate-fade-in">
          <div className="px-lg py-md border-b border-gray-border flex items-center justify-between">
            <span className="text-sm font-medium text-charcoal">Thông báo</span>
            {unreadCount > 0 && (
              <span className="text-xs text-primary font-medium">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-border">
            {alerts.length === 0 ? (
              <div className="px-lg py-3xl text-center">
                <Bell className="w-8 h-8 text-gray-medium mx-auto mb-2" />
                <p className="text-sm text-gray-dark">Không có thông báo mới</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-lg py-md flex gap-3 hover:bg-offwhite-1 transition-colors group"
                >
                  <div className="mt-0.5">{severityIcon(alert.severity)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-charcoal truncate">{alert.title}</p>
                    <p className="text-xs text-gray-dark mt-0.5 line-clamp-2">{alert.message}</p>
                  </div>
                  <button
                    onClick={() => markRead(alert.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-medium hover:text-charcoal transition-all flex-shrink-0"
                    title="Đánh dấu đã đọc"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="px-lg py-md border-t border-gray-border bg-offwhite-1">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Xem tất cả cảnh báo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── User avatar dropdown ───────────────────────────────────────────────────
function UserDropdown() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-standard hover:bg-offwhite-1 transition-colors"
      >
        <div className="w-8 h-8 bg-charcoal rounded-pill flex items-center justify-center text-white text-xs font-medium flex-shrink-0 shadow-raised">
          {initials}
        </div>
        <span className="text-sm font-medium text-charcoal hidden sm:block max-w-[120px] truncate">
          {user?.name}
        </span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-gray-dark hidden sm:block transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-card shadow-high border border-gray-border z-50 overflow-hidden animate-fade-in">
          <div className="px-lg py-md border-b border-gray-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-charcoal rounded-pill flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-raised">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{user?.name}</p>
                <p className="text-xs text-gray-dark truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="py-sm">
            <button
              onClick={() => { navigate('/settings'); setOpen(false); }}
              className="w-full flex items-center gap-3 px-lg py-md text-sm text-charcoal hover:bg-offwhite-1 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-dark" />
              Cài đặt & Hồ sơ
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="w-full flex items-center justify-between gap-3 px-lg py-md text-sm text-charcoal hover:bg-offwhite-1 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-base leading-none">🌐</span>
                Ngôn ngữ
              </div>
              <span className="text-xs font-medium text-gray-dark bg-offwhite-2 px-2 py-0.5 rounded-pill">
                {lang === 'vi' ? 'VI' : 'EN'}
              </span>
            </button>
          </div>

          <div className="border-t border-gray-border py-sm bg-offwhite-1">
            <button
              onClick={() => { void logout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-lg py-md text-sm text-semantic-error hover:bg-white transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Layout ────────────────────────────────────────────────────────────
export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-offwhite-2 overflow-hidden font-ui text-charcoal">
      {/* ── Header ── */}
      <header className="flex-shrink-0 h-14 sm:h-16 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-gray-border z-40 sticky top-0">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="lg:hidden p-2 -ml-2 text-gray-dark hover:text-charcoal rounded-standard hover:bg-offwhite-1 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-standard flex items-center justify-center shadow-raised">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-medium text-xl text-charcoal tracking-tight">Finance</span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={clsx(
            'fixed lg:static inset-y-0 left-0 z-40 lg:z-auto',
            'w-64 flex flex-col',
            'bg-white border-r border-gray-border',
            'transition-transform duration-300 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <nav className="flex-1 overflow-y-auto px-4 py-xl space-y-xl">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-sm text-xs font-medium uppercase tracking-widest text-gray-dark">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2.5 rounded-standard text-[15px] font-medium transition-all duration-200',
                          isActive
                            ? 'bg-beige-light text-primary'
                            : 'text-charcoal hover:bg-offwhite-1'
                        )}
                      >
                        <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive ? 'text-primary' : 'text-gray-dark')} />
                        <span>{item.label}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-pill bg-primary" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex-shrink-0 px-4 py-xl border-t border-gray-border bg-offwhite-1/50">
            <Link
              to="/settings"
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-standard text-[15px] font-medium transition-all duration-200',
                location.pathname === '/settings'
                  ? 'bg-beige-light text-primary'
                  : 'text-charcoal hover:bg-offwhite-1'
              )}
            >
              <Settings className={clsx('w-5 h-5 flex-shrink-0', location.pathname === '/settings' ? 'text-primary' : 'text-gray-dark')} />
              <span>Cài đặt</span>
            </Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-xl sm:p-3xl max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
