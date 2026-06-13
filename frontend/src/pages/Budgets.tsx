import { useEffect, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';

import { api } from '@/services/api';
import { BudgetProgress, Category } from '@/types';
import { useI18n } from '@/i18n';

export default function Budgets() {
  const { t } = useI18n();
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);
  const [form, setForm] = useState({ category_id: '', amount: '', period: 'monthly' });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; budgetId: number | null }>({ show: false, budgetId: null });
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const notifyDataChanged = () => {
    window.dispatchEvent(new Event('finance:data-changed'));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetData, categoryData] = await Promise.all([api.getBudgets(), api.getCategories()]);
      setBudgets(budgetData as BudgetProgress[]);
      setCategories(categoryData as Category[]);
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingBudgetId(null);
    setForm({ category_id: '', amount: '', period: 'monthly' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBudgetId) {
        await api.updateBudget(editingBudgetId, {
          amount: Number(form.amount),
          period: form.period,
        });
      } else {
        await api.createBudget({
          category_id: Number(form.category_id),
          amount: Number(form.amount),
          period: form.period,
        });
      }
      notifyDataChanged();
      resetModal();
      await loadData();
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModal.budgetId) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.deleteBudget(deleteModal.budgetId, deletePassword);
      notifyDataChanged();
      setDeleteModal({ show: false, budgetId: null });
      setDeletePassword('');
      await loadData();
    } catch (err: any) {
      setDeleteError(err.message || t('Mật khẩu không đúng'));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-xl font-ui">
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="font-display text-[32px] sm:text-[40px] tracking-tight text-charcoal">{t('Ngân sách')}</h1>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-pill bg-primary px-lg py-sm text-[16px] font-normal text-white hover:bg-primary-hover active:bg-primary transition-colors h-[36px]">
          <Plus className="h-4 w-4" />
          {t('Thêm ngân sách')}
        </button>
      </div>

      {error && <div className="rounded-standard border border-semantic-error/20 bg-semantic-error/5 px-lg py-md text-[14px] text-semantic-error animate-fade-in">{error}</div>}

      {budgets.length === 0 ? (
        <div className="rounded-card bg-white p-2xl text-center text-[15px] text-gray-medium shadow-elevated border border-gray-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {t('Chưa có ngân sách nào. Tạo ngân sách để theo dõi chi tiêu theo từng danh mục.')}
        </div>
      ) : (
        <div className="grid gap-xl md:grid-cols-2 xl:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {budgets.map((budget) => (
            <div key={budget.budget.id} className="rounded-card bg-white p-xl shadow-elevated hover:shadow-high transition-shadow border border-gray-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-[16px] text-charcoal">{budget.budget.category.name}</div>
                  <div className="mt-xs text-[14px] text-gray-dark">{formatCurrency(budget.budget.amount)} / {budget.budget.period}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingBudgetId(budget.budget.id);
                      setForm({
                        category_id: String(budget.budget.category_id),
                        amount: String(budget.budget.amount),
                        period: budget.budget.period,
                      });
                      setShowModal(true);
                    }}
                    className="rounded-standard p-1.5 text-gray-medium hover:bg-offwhite-1 hover:text-charcoal transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, budgetId: budget.budget.id })}
                    className="rounded-standard p-1.5 text-gray-medium hover:bg-semantic-error/5 hover:text-semantic-error transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-xl h-2 overflow-hidden rounded-pill bg-offwhite-3 border border-gray-border/50">
                <div
                  className={`h-full rounded-pill transition-all duration-500 ${budget.percentage >= 100 ? 'bg-semantic-error' : budget.percentage >= 80 ? 'bg-semantic-warning' : 'bg-primary'}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <div className="mt-md flex items-center justify-between text-[14px]">
                <span className="text-gray-dark">{t('Đã chi')}: <span className="font-medium text-charcoal">{formatCurrency(budget.spent)}</span></span>
                <span className={`font-medium ${budget.percentage >= 100 ? 'text-semantic-error' : budget.percentage >= 80 ? 'text-semantic-warning' : 'text-charcoal'}`}>{budget.percentage}%</span>
              </div>
              <div className="mt-xs text-[14px] text-gray-dark">{t('Còn lại')}: <span className="font-medium text-charcoal">{formatCurrency(budget.remaining)}</span></div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingBudgetId ? t('Lưu thay đổi') : t('Thêm ngân sách')} onClose={resetModal}>
          <form onSubmit={handleSubmit} className="space-y-lg font-ui">
            <select
              required
              disabled={!!editingBudgetId}
              value={form.category_id}
              onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
              className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] text-charcoal bg-white shadow-raised h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all disabled:bg-offwhite-2 disabled:text-gray-dark"
            >
              <option value="">{t('Chọn danh mục')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="1000"
              required
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder={t('Số tiền giới hạn')}
              className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] text-charcoal bg-white shadow-raised h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all placeholder-gray-medium"
            />
            <select
              value={form.period}
              onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
              className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] text-charcoal bg-white shadow-raised h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all"
            >
              <option value="weekly">{t('Hàng tuần')}</option>
              <option value="monthly">{t('Hàng tháng')}</option>
              <option value="yearly">{t('Hàng năm')}</option>
            </select>
            <button type="submit" className="w-full rounded-pill bg-primary px-lg py-sm text-[16px] font-normal text-white hover:bg-primary-hover active:bg-primary h-[40px] transition-colors mt-xl">
              {editingBudgetId ? t('Lưu thay đổi') : t('Lưu ngân sách')}
            </button>
          </form>
        </Modal>
      )}

      {deleteModal.show && (
        <Modal title={t('Xác nhận xóa ngân sách')} onClose={() => setDeleteModal({ show: false, budgetId: null })}>
          <form onSubmit={handleDelete} className="space-y-lg font-ui">
            <input
              type="password"
              required
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t('Nhập mật khẩu')}
              className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] text-charcoal bg-white shadow-raised h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all placeholder-gray-medium"
            />
            {deleteError && <div className="rounded-standard bg-semantic-error/5 px-md py-sm text-[14px] text-semantic-error border border-semantic-error/20">{deleteError}</div>}
            <div className="flex gap-md mt-xl">
              <button type="button" onClick={() => setDeleteModal({ show: false, budgetId: null })} className="flex-1 rounded-pill border border-gray-border px-lg py-sm text-[16px] font-normal text-charcoal hover:bg-offwhite-1 h-[40px] transition-colors shadow-raised">
                {t('Hủy')}
              </button>
              <button type="submit" disabled={deleteLoading} className="flex-1 rounded-pill bg-semantic-error px-lg py-sm text-[16px] font-normal text-white hover:bg-semantic-error/90 active:bg-semantic-error disabled:opacity-50 h-[40px] transition-colors">
                {deleteLoading ? t('Đang xóa...') : t('Xóa')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/20 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-card bg-white shadow-high border border-gray-border animate-scale-in">
        <div className="flex items-center justify-between border-b border-gray-border px-xl py-md">
          <h3 className="font-display text-[24px] text-charcoal">{title}</h3>
          <button onClick={onClose} className="rounded-standard p-1 text-gray-medium hover:bg-offwhite-1 hover:text-charcoal transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-xl">{children}</div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}
