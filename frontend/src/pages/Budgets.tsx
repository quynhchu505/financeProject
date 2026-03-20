import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { BudgetProgress, Category } from '@/types';
import { Plus, X } from 'lucide-react';

export default function Budgets() {
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category_id: '', amount: '', period: 'monthly' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bgt, cats] = await Promise.all([
        api.getBudgets(),
        api.getCategories(),
      ]);
      setBudgets(bgt as BudgetProgress[]);
      setCategories(cats as Category[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBudget({
        category_id: Number(form.category_id),
        amount: Number(form.amount),
        period: form.period,
      });
      setShowModal(false);
      setForm({ category_id: '', amount: '', period: 'monthly' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa ngân sách này?')) return;
    await api.deleteBudget(id);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ngân sách</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm ngân sách
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          Chưa có ngân sách nào. Tạo ngân sách để theo dõi chi tiêu theo từng danh mục.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((bp) => (
            <div key={bp.budget.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: bp.budget.category.color }}
                  >
                    {bp.budget.category.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{bp.budget.category.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(bp.budget.amount)} / {bp.budget.period === 'monthly' ? 'tháng' : bp.budget.period}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(bp.budget.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      bp.percentage >= 100 ? 'bg-red-500' : bp.percentage >= 80 ? 'bg-amber-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min(bp.percentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Đã chi: <span className="font-medium">{formatCurrency(bp.spent)}</span>
                </span>
                <span className={`font-medium ${bp.percentage >= 100 ? 'text-red-600' : 'text-gray-600'}`}>
                  {bp.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Còn lại: {formatCurrency(bp.remaining)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Thêm ngân sách</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền giới hạn</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="10000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ</label>
                <select
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                  <option value="yearly">Hàng năm</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium"
              >
                Lưu ngân sách
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}
