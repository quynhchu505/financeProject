import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function Login() {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite-2 flex flex-col items-center justify-center p-xl font-ui">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-2xl animate-fade-in-up">
          <div className="w-16 h-16 bg-white rounded-card flex items-center justify-center mx-auto mb-md shadow-elevated border border-gray-border">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-[40px] tracking-tight text-charcoal">{t('Monarch')}</h1>
          <p className="text-gray-dark mt-xs text-[16px]">{t('Quản lý tài chính cá nhân thông minh')}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-card shadow-high border border-gray-border p-2xl animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h2 className="font-display text-[28px] text-charcoal mb-xl text-center">
            {isRegister ? t('Tạo tài khoản mới') : t('Đăng nhập')}
          </h2>

          {error && (
            <div className="mb-xl p-md bg-semantic-error/5 border border-semantic-error/20 rounded-standard text-[14px] text-semantic-error animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-lg">
            {isRegister && (
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <label className="block font-utility text-[16px] text-charcoal mb-sm">{t('Họ và tên')}</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-lg py-md bg-white border border-gray-border rounded-standard focus:ring-[3px] focus:ring-primary/10 focus:border-[2px] focus:border-primary outline-none transition-all text-[15px] text-charcoal placeholder-gray-medium shadow-raised h-[40px]"
                  placeholder={t('Nguyễn Văn A')}
                />
              </div>
            )}

            <div className="animate-fade-in-up" style={{ animationDelay: isRegister ? '250ms' : '200ms' }}>
              <label className="block font-utility text-[16px] text-charcoal mb-sm">{t('Email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-lg py-md bg-white border border-gray-border rounded-standard focus:ring-[3px] focus:ring-primary/10 focus:border-[2px] focus:border-primary outline-none transition-all text-[15px] text-charcoal placeholder-gray-medium shadow-raised h-[40px]"
                placeholder={t('email@example.com')}
              />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: isRegister ? '300ms' : '250ms' }}>
              <label className="block font-utility text-[16px] text-charcoal mb-sm">{t('Mật khẩu')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-lg py-md bg-white border border-gray-border rounded-standard focus:ring-[3px] focus:ring-primary/10 focus:border-[2px] focus:border-primary outline-none transition-all text-[15px] text-charcoal placeholder-gray-medium shadow-raised h-[40px] pr-12"
                  placeholder={t('••••••••')}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-medium hover:text-charcoal transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-sm rounded-pill font-ui text-[16px] font-normal min-h-[36px] hover:bg-primary-hover active:bg-primary disabled:bg-gray-medium disabled:text-gray-dark transition-all duration-200 mt-xl animate-fade-in-up"
              style={{ animationDelay: isRegister ? '350ms' : '300ms' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('Đang xử lý...')}
                </span>
              ) : (isRegister ? t('Đăng ký') : t('Đăng nhập'))}
            </button>
          </form>

          <div className="mt-xl text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-[15px] text-charcoal hover:text-primary font-medium transition-colors"
            >
              {isRegister ? t('Đã có tài khoản? Đăng nhập') : t('Chưa có tài khoản? Đăng ký')}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-dark text-[14px] font-[350] mt-2xl animate-fade-in" style={{ animationDelay: '400ms' }}>
          {t('Hệ thống quản lý tài chính cá nhân với AI')}
        </p>
      </div>
    </div>
  );
}
