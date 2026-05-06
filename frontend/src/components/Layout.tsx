import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Receipt, PiggyBank, BarChart3, MessageCircle,
  LogOut, Wallet, Menu, Bell, Search, Settings, Sun, Moon,
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
    if (severity === 'high') return <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />;
    if (severity === 'medium') return <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
    return <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Thông báo</span>
            {unreadCount > 0 && (
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Không có thông báo mới</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="mt-0.5">{severityIcon(alert.severity)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{alert.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{alert.message}</p>
                  </div>
                  <button
                    onClick={() => markRead(alert.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-all flex-shrink-0"
                    title="Đánh dấu đã đọc"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
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
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block max-w-[120px] truncate">
          {user?.name}
        </span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-gray-400 hidden sm:block transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { navigate('/settings'); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              Cài đặt & Hồ sơ
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-gray-400" />
                  : <Moon className="w-4 h-4 text-gray-400" />}
                {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              </div>
              <div className={clsx('w-9 h-5 rounded-full relative transition-colors duration-200', theme === 'dark' ? 'bg-primary-500' : 'bg-gray-300')}>
                <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200', theme === 'dark' ? 'left-[18px]' : 'left-0.5')} />
              </div>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-base leading-none">🌐</span>
                Ngôn ngữ
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {lang === 'vi' ? 'VI' : 'EN'}
              </span>
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 py-1">
            <button
              onClick={() => { void logout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 h-14 sm:h-16 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 z-40 sticky top-0">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo (mobile only — desktop logo is in sidebar) */}
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0 lg:hidden">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-base text-gray-900 dark:text-gray-100 hidden sm:block">FinanceManager</span>
        </Link>

        {/* Global search */}
        <div className="flex-1 hidden sm:block max-w-sm lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm giao dịch, danh mục..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={clsx(
            'fixed lg:static inset-y-0 left-0 z-40 lg:z-auto',
            'w-60 flex flex-col',
            'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700/50',
            'transition-transform duration-300 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Sidebar logo (desktop) */}
          <div className="hidden lg:flex items-center gap-2.5 h-14 sm:h-16 px-5 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base text-gray-900 dark:text-gray-100">FinanceManager</span>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                        )}
                      >
                        <Icon className={clsx('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500')} />
                        <span>{item.label}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Settings link pinned to bottom */}
          <div className="flex-shrink-0 px-3 py-3 border-t border-gray-100 dark:border-gray-700/50">
            <Link
              to="/settings"
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                location.pathname === '/settings'
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Settings className={clsx('w-[18px] h-[18px] flex-shrink-0', location.pathname === '/settings' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500')} />
              <span>Cài đặt</span>
            </Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
