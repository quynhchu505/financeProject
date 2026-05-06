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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('Ngân sách')}</h1>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" />
          {t('Thêm ngân sách')}
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {budgets.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          {t('Chưa có ngân sách nào. Tạo ngân sách để theo dõi chi tiêu theo từng danh mục.')}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => (
            <div key={budget.budget.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{budget.budget.category.name}</div>
                  <div className="mt-1 text-sm text-gray-500">{formatCurrency(budget.budget.amount)} / {budget.budget.period}</div>
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
                    className="rounded p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, budgetId: budget.budget.id })}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${budget.percentage >= 100 ? 'bg-red-500' : budget.percentage >= 80 ? 'bg-amber-500' : 'bg-primary-500'}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('Đã chi')}: {formatCurrency(budget.spent)}</span>
                <span className={`font-semibold ${budget.percentage >= 100 ? 'text-red-600' : 'text-gray-700'}`}>{budget.percentage}%</span>
              </div>
              <div className="mt-1 text-sm text-gray-500">{t('Còn lại')}: {formatCurrency(budget.remaining)}</div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingBudgetId ? t('Lưu thay đổi') : t('Thêm ngân sách')} onClose={resetModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              required
              disabled={!!editingBudgetId}
              value={form.category_id}
              onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
            <select
              value={form.period}
              onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="weekly">{t('Hàng tuần')}</option>
              <option value="monthly">{t('Hàng tháng')}</option>
              <option value="yearly">{t('Hàng năm')}</option>
            </select>
            <button type="submit" className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              {editingBudgetId ? t('Lưu thay đổi') : t('Lưu ngân sách')}
            </button>
          </form>
        </Modal>
      )}

      {deleteModal.show && (
        <Modal title={t('Xác nhận xóa ngân sách')} onClose={() => setDeleteModal({ show: false, budgetId: null })}>
          <form onSubmit={handleDelete} className="space-y-4">
            <input
              type="password"
              required
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t('Nhập mật khẩu')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
            {deleteError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{deleteError}</div>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteModal({ show: false, budgetId: null })} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
                {t('Hủy')}
              </button>
              <button type="submit" disabled={deleteLoading} className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}
