import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import {
  User as UserIcon, Shield, Bell, LogOut, Save, Eye, EyeOff, Check, AlertCircle,
  Camera, Trash2, Mail, Smartphone, Monitor, Globe, KeyRound, AlertTriangle, X,
} from 'lucide-react';
import clsx from 'clsx';
import type { LoginHistoryItem, SessionItem, NotificationPrefs, User } from '@/types';

type Tab = 'profile' | 'security' | 'notifications';

// ── Toast hook ─────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const show = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

// ── Reusable primitives ────────────────────────────────────────────────────
function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-dark">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-border  rounded-standard bg-white  text-charcoal  focus:outline-none focus:ring-2 focus:ring-primary-400 :ring-primary focus:border-transparent transition-all';

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={clsx(
        'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
        checked ? 'bg-primary' : 'bg-gray-300 ',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

function ConfirmModal({
  open, onClose, title, children, confirmText = 'Xác nhận', confirmDisabled, onConfirm, danger,
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
  confirmText?: string; confirmDisabled?: boolean; onConfirm: () => void; danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-card shadow-2xl border border-gray-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-border">
          <h3 className="text-base font-medium text-charcoal">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-medium hover:text-gray-dark :text-gray-200 rounded-standard">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="px-5 py-3 border-t border-gray-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-charcoal hover:bg-offwhite-2 :bg-gray-800 rounded-standard transition-colors">
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={clsx(
              'px-4 py-2 text-sm font-medium text-white rounded-standard transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-hover',
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Profile tab ────────────────────────────────────────────────────────────
const CURRENCIES = ['VND', 'USD', 'EUR', 'JPY', 'GBP', 'KRW', 'SGD'];
const TIMEZONES = [
  'Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Seoul',
  'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'UTC',
];
const DATE_FORMATS = ['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'];

function ProfileTab({ onSuccess, onError }: { onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    date_of_birth: user?.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
    gender: user?.gender ?? '',
    address: user?.address ?? '',
    currency: user?.currency ?? 'VND',
    timezone: user?.timezone ?? 'Asia/Ho_Chi_Minh',
    language: user?.language ?? 'vi',
    date_format: user?.date_format ?? 'dd/MM/yyyy',
    week_start: user?.week_start ?? 'monday',
  });
  const [saving, setSaving] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      date_of_birth: user.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
      gender: user.gender ?? '',
      address: user.address ?? '',
      currency: user.currency ?? 'VND',
      timezone: user.timezone ?? 'Asia/Ho_Chi_Minh',
      language: user.language ?? 'vi',
      date_format: user.date_format ?? 'dd/MM/yyyy',
      week_start: user.week_start ?? 'monday',
    });
  }, [user]);

  const initials = (form.name || user?.name || 'U')
    .split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();

  const dirty =
    form.name !== (user?.name ?? '') ||
    form.phone !== (user?.phone ?? '') ||
    form.date_of_birth !== (user?.date_of_birth ? user.date_of_birth.slice(0, 10) : '') ||
    form.gender !== (user?.gender ?? '') ||
    form.address !== (user?.address ?? '') ||
    form.currency !== (user?.currency ?? 'VND') ||
    form.timezone !== (user?.timezone ?? 'Asia/Ho_Chi_Minh') ||
    form.language !== (user?.language ?? 'vi') ||
    form.date_format !== (user?.date_format ?? 'dd/MM/yyyy') ||
    form.week_start !== (user?.week_start ?? 'monday');

  const handleSave = async () => {
    if (!form.name.trim()) {
      onError('Họ tên không được để trống');
      return;
    }
    setSaving(true);
    try {
      await api.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        date_of_birth: form.date_of_birth ? `${form.date_of_birth}T00:00:00Z` : null,
        gender: (form.gender || null) as 'male' | 'female' | 'other' | null,
        address: form.address.trim() || null,
        currency: form.currency,
        timezone: form.timezone,
        language: form.language as 'vi' | 'en',
        date_format: form.date_format,
        week_start: form.week_start as 'monday' | 'sunday',
      });
      await refresh();
      onSuccess('Đã lưu hồ sơ');
    } catch (e: any) {
      onError(e.message ?? 'Không thể cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onError('Ảnh quá lớn (tối đa 5MB)');
      return;
    }
    setUploading(true);
    try {
      await api.uploadAvatar(file);
      await refresh();
      onSuccess('Đã cập nhật ảnh đại diện');
    } catch (err: any) {
      onError(err.message ?? 'Upload thất bại');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setUploading(true);
    try {
      await api.deleteAvatar();
      await refresh();
      onSuccess('Đã xoá ảnh đại diện');
    } catch (err: any) {
      onError(err.message ?? 'Không thể xoá');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Avatar */}
      <section className="flex items-start gap-5">
        <div className="relative">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="avatar"
              className="w-20 h-20 rounded-card object-cover shadow-high"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-hover rounded-card flex items-center justify-center text-white text-2xl font-bold shadow-high">
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-border rounded-full flex items-center justify-center shadow hover:bg-offwhite-1 :bg-gray-700 transition-colors"
            title="Thay ảnh đại diện"
          >
            <Camera className="w-3.5 h-3.5 text-gray-dark" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal truncate">{user?.name}</p>
          <p className="text-xs text-gray-dark mt-0.5 truncate">{user?.email}</p>
          <p className="text-xs text-gray-medium mt-0.5">
            Tham gia từ {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 text-xs font-medium border border-gray-border rounded-standard hover:bg-offwhite-1 :bg-gray-800 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
            </button>
            {user?.avatar_url && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={uploading}
                className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-standard hover:bg-red-50 :bg-red-950/30 transition-colors disabled:opacity-50"
              >
                Xoá ảnh
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-medium">PNG, JPG, WEBP, GIF — tối đa 5MB</p>
        </div>
      </section>

      {/* Basic info */}
      <section>
        <h3 className="text-sm font-medium text-charcoal mb-4">Thông tin cơ bản</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Họ và tên *" className="sm:col-span-2">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>

          <Field label="Email" hint="Bấm để đổi email">
            <button
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm border border-gray-border rounded-standard bg-offwhite-1 text-charcoal hover:bg-offwhite-2 :bg-gray-700 transition-colors text-left"
            >
              <span className="truncate">{user?.email}</span>
              <Mail className="w-4 h-4 text-gray-medium flex-shrink-0" />
            </button>
          </Field>

          <Field label="Số điện thoại">
            <input
              type="tel"
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+84..."
            />
          </Field>

          <Field label="Ngày sinh">
            <input
              type="date"
              className={inputCls}
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            />
          </Field>

          <Field label="Giới tính">
            <select
              className={inputCls}
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">— Chưa chọn —</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </Field>

          <Field label="Địa chỉ" className="sm:col-span-2">
            <textarea
              className={clsx(inputCls, 'resize-none')}
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Số nhà, đường, phường, quận, thành phố..."
            />
          </Field>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h3 className="text-sm font-medium text-charcoal mb-4">Tuỳ chọn cá nhân</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Đơn vị tiền tệ">
            <select className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Múi giờ">
            <select className={inputCls} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </Field>

          <Field label="Ngôn ngữ giao diện">
            <select className={inputCls} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as 'vi' | 'en' })}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </Field>

          <Field label="Định dạng ngày">
            <select className={inputCls} value={form.date_format} onChange={(e) => setForm({ ...form, date_format: e.target.value })}>
              {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>

          <Field label="Ngày bắt đầu tuần">
            <select className={inputCls} value={form.week_start} onChange={(e) => setForm({ ...form, week_start: e.target.value as 'monday' | 'sunday' })}>
              <option value="monday">Thứ Hai</option>
              <option value="sunday">Chủ Nhật</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Sticky save bar */}
      {dirty && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 bg-gray-900 text-white rounded-card shadow-2xl animate-fade-in">
          <span className="text-sm">Bạn có thay đổi chưa lưu</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary text-white text-sm font-medium rounded-standard transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      )}

      <EmailChangeModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        currentEmail={user?.email ?? ''}
        onSuccess={async (m) => { await refresh(); onSuccess(m); }}
        onError={onError}
      />
    </div>
  );
}

function EmailChangeModal({
  open, onClose, currentEmail, onSuccess, onError,
}: {
  open: boolean; onClose: () => void; currentEmail: string;
  onSuccess: (m: string) => void; onError: (m: string) => void;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setNewEmail(''); setPassword(''); }
  }, [open]);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail) && newEmail !== currentEmail && !!password;

  const submit = async () => {
    setSaving(true);
    try {
      await api.changeEmail({ new_email: newEmail, password });
      onSuccess('Đã đổi email');
      onClose();
    } catch (e: any) {
      onError(e.message ?? 'Đổi email thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      title="Đổi địa chỉ email"
      confirmText={saving ? 'Đang đổi...' : 'Xác nhận đổi'}
      confirmDisabled={!valid || saving}
      onConfirm={submit}
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-dark">
          Email hiện tại: <span className="font-medium text-charcoal">{currentEmail}</span>
        </p>
        <Field label="Email mới">
          <input type="email" className={inputCls} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
        </Field>
        <Field label="Mật khẩu hiện tại" hint="Để xác nhận thao tác">
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
      </div>
    </ConfirmModal>
  );
}

// ── Security tab ───────────────────────────────────────────────────────────
function SecurityTab({ onSuccess, onError }: { onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const { logout } = useAuth();
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadMeta = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const [h, s] = await Promise.all([api.getLoginHistory(20), api.getSessions()]);
      setHistory((h as LoginHistoryItem[]) ?? []);
      setSessions((s as SessionItem[]) ?? []);
    } catch {
      // ignore
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => { void loadMeta(); }, [loadMeta]);

  const strength = (() => {
    const p = pwForm.next;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][strength];

  const submitPassword = async () => {
    if (pwForm.next !== pwForm.confirm) return onError('Mật khẩu xác nhận không khớp');
    if (pwForm.next.length < 6) return onError('Mật khẩu mới tối thiểu 6 ký tự');
    setSaving(true);
    try {
      await api.changePassword({ current_password: pwForm.current, new_password: pwForm.next });
      onSuccess('Đã đổi mật khẩu — đang đăng xuất...');
      setTimeout(() => void logout(), 1500);
    } catch (e: any) {
      onError(e.message ?? 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({ field, label }: { field: 'current' | 'next' | 'confirm'; label: string }) => (
    <Field label={label}>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={pwForm[field]}
          onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
          className={clsx(inputCls, 'pr-10')}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((s) => ({ ...s, [field]: !s[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-medium hover:text-gray-dark :text-gray-300"
        >
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  );

  const revoke = async (id: number) => {
    try {
      await api.revokeSession(id);
      setSessions((s) => s.filter((x) => x.id !== id));
      onSuccess('Đã đăng xuất phiên');
    } catch (e: any) {
      onError(e.message ?? 'Không thể đăng xuất phiên');
    }
  };

  const parseUA = (ua: string | null) => {
    if (!ua) return { device: 'Không rõ', icon: Monitor };
    if (/iphone|android.*mobile|mobi/i.test(ua)) return { device: 'Điện thoại', icon: Smartphone };
    if (/ipad|tablet/i.test(ua)) return { device: 'Tablet', icon: Smartphone };
    const browser = /chrome/i.test(ua) ? 'Chrome'
      : /firefox/i.test(ua) ? 'Firefox'
      : /safari/i.test(ua) ? 'Safari'
      : /edge/i.test(ua) ? 'Edge' : 'Trình duyệt';
    const os = /windows/i.test(ua) ? 'Windows'
      : /mac/i.test(ua) ? 'macOS'
      : /linux/i.test(ua) ? 'Linux' : '';
    return { device: `${browser}${os ? ' · ' + os : ''}`, icon: Monitor };
  };

  return (
    <div className="space-y-8">
      {/* Change password */}
      <section>
        <h3 className="text-sm font-medium text-charcoal mb-1 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-gray-medium" />
          Đổi mật khẩu
        </h3>
        <p className="text-xs text-gray-dark mb-4">
          Sau khi đổi, bạn sẽ bị đăng xuất khỏi tất cả thiết bị.
        </p>
        <div className="grid gap-4 max-w-md">
          <PasswordInput field="current" label="Mật khẩu hiện tại" />
          <div>
            <PasswordInput field="next" label="Mật khẩu mới" />
            {pwForm.next && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={clsx('h-1 flex-1 rounded-full transition-colors', i <= strength ? strengthColor : 'bg-gray-200 ')} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-dark">{strengthLabel}</p>
              </div>
            )}
          </div>
          <PasswordInput field="confirm" label="Xác nhận mật khẩu mới" />
          <button
            onClick={submitPassword}
            disabled={saving || !pwForm.current || !pwForm.next || !pwForm.confirm}
            className="self-start flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-standard transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield className="w-4 h-4" />
            {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </section>

      {/* 2FA placeholder */}
      <section className="border border-dashed border-gray-border rounded-card p-5 bg-offwhite-1/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-1">Xác thực hai yếu tố (2FA)</h3>
            <p className="text-xs text-gray-dark">
              Tăng cường bảo mật bằng mã TOTP từ Google Authenticator. Hỗ trợ backup codes.
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
            Sắp ra mắt
          </span>
        </div>
      </section>

      {/* Login history */}
      <section>
        <h3 className="text-sm font-medium text-charcoal mb-1">Lịch sử đăng nhập</h3>
        <p className="text-xs text-gray-dark mb-4">
          20 lần đăng nhập gần nhất. Liên hệ hỗ trợ nếu thấy hoạt động đáng ngờ.
        </p>
        <div className="border border-gray-border rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-offwhite-1 text-xs uppercase text-gray-dark">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Thời gian</th>
                  <th className="px-4 py-2.5 text-left font-medium">Thiết bị</th>
                  <th className="px-4 py-2.5 text-left font-medium">IP</th>
                  <th className="px-4 py-2.5 text-left font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingMeta ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-xs text-gray-dark">Đang tải...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-xs text-gray-dark">Chưa có lịch sử</td></tr>
                ) : (
                  history.map((h) => {
                    const { device } = parseUA(h.user_agent);
                    return (
                      <tr key={h.id} className="hover:bg-offwhite-1 :bg-gray-800/30">
                        <td className="px-4 py-2.5 text-xs text-charcoal whitespace-nowrap">
                          {new Date(h.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-dark truncate max-w-[200px]" title={h.user_agent ?? ''}>{device}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-dark font-mono">{h.ip_address ?? '—'}</td>
                        <td className="px-4 py-2.5">
                          {h.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              <Check className="w-3 h-3" /> Thành công
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full" title={h.failure_reason ?? ''}>
                              <AlertTriangle className="w-3 h-3" /> Thất bại
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Active sessions */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-charcoal">Phiên đang hoạt động</h3>
          <button
            onClick={() => { void api.logoutAll().then(() => logout()); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-standard hover:bg-red-50 :bg-red-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất tất cả
          </button>
        </div>
        <p className="text-xs text-gray-dark mb-4">
          Các thiết bị đang đăng nhập vào tài khoản của bạn.
        </p>
        <div className="space-y-2">
          {loadingMeta ? (
            <div className="text-xs text-gray-dark py-4 text-center">Đang tải...</div>
          ) : sessions.length === 0 ? (
            <div className="text-xs text-gray-dark py-4 text-center">Không có phiên nào</div>
          ) : (
            sessions.map((s) => {
              const { device, icon: Icon } = parseUA(s.user_agent);
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 border border-gray-border rounded-standard">
                  <div className="w-9 h-9 bg-offwhite-2 rounded-standard flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{device}</p>
                    <p className="text-xs text-gray-dark truncate">
                      {s.ip_address ?? 'IP không rõ'} · Hoạt động{' '}
                      {s.last_used_at ? new Date(s.last_used_at).toLocaleString('vi-VN') : new Date(s.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <button
                    onClick={() => revoke(s.id)}
                    className="px-3 py-1.5 text-xs font-medium text-charcoal border border-gray-border rounded-standard hover:bg-offwhite-1 :bg-gray-800 transition-colors flex-shrink-0"
                  >
                    Đăng xuất
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="border border-red-200 bg-red-50/50 rounded-card p-5">
        <h3 className="text-sm font-medium text-red-700 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Vùng nguy hiểm
        </h3>
        <p className="text-xs text-red-600/80 mb-4">
          Xoá tài khoản sẽ xoá vĩnh viễn toàn bộ giao dịch, ngân sách và dữ liệu liên quan. Hành động không thể hoàn tác.
        </p>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-standard transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Xoá tài khoản
        </button>
      </section>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onError={onError} />
    </div>
  );
}

function DeleteAccountModal({
  open, onClose, onError,
}: { open: boolean; onClose: () => void; onError: (m: string) => void }) {
  const { user, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setPassword(''); setConfirmation(''); }
  }, [open]);

  const valid = !!password && confirmation.trim().toLowerCase() === (user?.email ?? '').toLowerCase();

  const submit = async () => {
    setSaving(true);
    try {
      await api.deleteMyAccount({ password, confirmation });
      void logout();
    } catch (e: any) {
      onError(e.message ?? 'Xoá tài khoản thất bại');
      setSaving(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      title="Xoá tài khoản vĩnh viễn"
      confirmText={saving ? 'Đang xoá...' : 'Xoá tài khoản'}
      confirmDisabled={!valid || saving}
      onConfirm={submit}
      danger
    >
      <div className="space-y-4">
        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-standard text-xs text-red-700">
          Toàn bộ dữ liệu (giao dịch, ngân sách, danh mục, cảnh báo, lịch sử chat) sẽ bị xoá. Không thể khôi phục.
        </div>
        <Field label="Mật khẩu hiện tại">
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Xác nhận" hint={`Gõ chính xác "${user?.email}" để xác nhận xoá`}>
          <input className={inputCls} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder={user?.email ?? ''} />
        </Field>
      </div>
    </ConfirmModal>
  );
}

// ── Notifications tab ──────────────────────────────────────────────────────
const NOTIF_TYPES: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
  { key: 'budget_alerts', label: 'Cảnh báo vượt ngân sách', desc: 'Khi chi tiêu một danh mục vượt 80% hạn mức' },
  { key: 'bill_reminders', label: 'Nhắc hoá đơn định kỳ', desc: 'Trước khi hoá đơn đến hạn 3 ngày' },
  { key: 'weekly_summary', label: 'Tóm tắt tài chính cuối tuần', desc: 'Báo cáo thu chi mỗi Chủ nhật' },
  { key: 'goal_reached', label: 'Đạt mục tiêu tiết kiệm', desc: 'Khi bạn hoàn thành một mục tiêu đã đặt' },
  { key: 'new_login', label: 'Đăng nhập từ thiết bị mới', desc: 'Phát hiện đăng nhập từ thiết bị/IP lạ' },
  { key: 'anomaly_detected', label: 'Giao dịch bất thường', desc: 'AI phát hiện giao dịch có dấu hiệu lạ' },
];

function NotificationsTab({ onSuccess, onError }: { onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getNotificationPrefs()
      .then((p) => setPrefs(p as NotificationPrefs))
      .catch(() => onError('Không tải được cài đặt thông báo'));
  }, [onError]);

  const update = (key: keyof NotificationPrefs) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await api.updateNotificationPrefs(prefs as unknown as Record<string, boolean>);
      onSuccess('Đã lưu cài đặt thông báo');
    } catch (e: any) {
      onError(e.message ?? 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!prefs) {
    return <div className="py-8 text-center text-sm text-gray-dark">Đang tải...</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-medium text-charcoal mb-1">Loại thông báo</h3>
        <p className="text-xs text-gray-dark mb-4">
          Chọn các sự kiện bạn muốn nhận thông báo.
        </p>
        <div className="divide-y divide-gray-100 border border-gray-border rounded-card">
          {NOTIF_TYPES.map((t) => (
            <div key={t.key} className="flex items-start justify-between gap-4 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal">{t.label}</p>
                <p className="text-xs text-gray-dark mt-0.5">{t.desc}</p>
              </div>
              <Toggle checked={!!prefs[t.key]} onChange={() => update(t.key)} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-charcoal mb-1">Kênh nhận</h3>
        <p className="text-xs text-gray-dark mb-4">
          Chọn cách bạn muốn nhận thông báo.
        </p>
        <div className="divide-y divide-gray-100 border border-gray-border rounded-card">
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-primary-50 text-primary rounded-standard flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal">Trong ứng dụng</p>
                <p className="text-xs text-gray-dark">Hiển thị qua chuông thông báo trên Header</p>
              </div>
            </div>
            <Toggle checked={prefs.channel_in_app} onChange={() => update('channel_in_app')} />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-offwhite-2 text-gray-dark rounded-standard flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal">Email</p>
                <p className="text-xs text-gray-dark flex items-center gap-2">
                  Gửi tới hộp thư của bạn
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Beta</span>
                </p>
              </div>
            </div>
            <Toggle checked={prefs.channel_email} onChange={() => update('channel_email')} />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3.5 opacity-60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-offwhite-2 text-gray-dark rounded-standard flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal">Telegram bot</p>
                <p className="text-xs text-gray-dark">Sắp ra mắt</p>
              </div>
            </div>
            <Toggle checked={false} onChange={() => {}} disabled />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-standard transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserIcon },
  { id: 'security', label: 'Bảo mật', icon: Shield },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { toast, show } = useToast();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Cài đặt</h1>
        <p className="text-sm text-gray-dark mt-1">Quản lý hồ sơ, bảo mật và cách bạn nhận thông báo</p>
      </div>

      {toast && (
        <div className={clsx(
          'fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-card text-sm font-medium shadow-lg animate-fade-in',
          toast.type === 'success'
            ? 'bg-green-50  text-green-700  border border-green-200 '
            : 'bg-red-50  text-red-700  border border-red-200 '
        )}>
          {toast.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Vertical tabs */}
        <nav className="lg:sticky lg:top-20 lg:self-start space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-standard text-sm font-medium transition-all text-left',
                activeTab === id
                  ? 'bg-primary-50  text-primary-hover '
                  : 'text-gray-dark  hover:bg-offwhite-1 :bg-gray-800/50',
              )}
            >
              <Icon className={clsx('w-4 h-4', activeTab === id ? 'text-primary ' : 'text-gray-medium')} />
              {label}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div className="bg-white rounded-card border border-gray-border shadow-elevated p-6">
          {activeTab === 'profile' && (
            <ProfileTab onSuccess={(m) => show('success', m)} onError={(m) => show('error', m)} />
          )}
          {activeTab === 'security' && (
            <SecurityTab onSuccess={(m) => show('success', m)} onError={(m) => show('error', m)} />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab onSuccess={(m) => show('success', m)} onError={(m) => show('error', m)} />
          )}
        </div>
      </div>
    </div>
  );
}
