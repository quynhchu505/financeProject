import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Transaction, Category, Account } from '@/types';
import { Plus, Trash2, Edit2, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    transaction_type: 'expense' as const,
    description: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txs, cats, accs] = await Promise.all([
        api.getTransactions(),
        api.getCategories(),
        api.getAccounts(),
      ]);
      setTransactions(txs as Transaction[]);
      setCategories(cats as Category[]);
      setAccounts(accs as Account[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTransaction({
        account_id: Number(form.account_id),
        category_id: form.category_id ? Number(form.category_id) : undefined,
        amount: Number(form.amount),
        transaction_type: form.transaction_type,
        description: form.description || undefined,
        date: new Date(form.date).toISOString(),
      });
      setShowModal(false);
      setForm({ account_id: '', category_id: '', amount: '', transaction_type: 'expense', description: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa giao dịch này?')) return;
    await api.deleteTransaction(id);
    loadData();
  };

  const handleAICategorize = async () => {
    if (!form.description) return;
    setAiLoading(true);
    try {
      const result = await api.categorizeTransaction(form.description, form.amount ? Number(form.amount) : undefined) as any;
      setForm((f) => ({ ...f, category_id: String(result.category_id) }));
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Giao dịch</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm giao dịch
        </button>
      </div>

      {/* Account selector */}
      {accounts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-gray-500 py-2">Tài khoản:</span>
          {accounts.map((acc) => (
            <div key={acc.id} className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm">
              <span className="font-medium">{acc.name}</span>
              <span className="text-gray-500 ml-1">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(acc.balance)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Transaction list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            Chưa có giao dịch nào. Bấm "Thêm giao dịch" để bắt đầu.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{tx.description || '—'}</td>
                  <td className="px-4 py-3">
                    {tx.category ? (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: tx.category.color }}
                      >
                        {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${tx.transaction_type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.transaction_type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add transaction modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Thêm giao dịch</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, transaction_type: 'expense' })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    form.transaction_type === 'expense' ? 'bg-white shadow text-red-600' : 'text-gray-500'
                  }`}
                >
                  Chi tiêu
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, transaction_type: 'income' })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    form.transaction_type === 'income' ? 'bg-white shadow text-green-600' : 'text-gray-500'
                  }`}
                >
                  Thu nhập
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
                <select
                  required
                  value={form.account_id}
                  onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Chọn tài khoản</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <button
                    type="button"
                    onClick={handleAICategorize}
                    disabled={!form.description || aiLoading}
                    className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-50 transition-colors"
                    title="Phân loại tự động bằng AI"
                  >
                    {aiLoading ? (
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Mua cơm trưa công ty..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                <input
                  type="datetime-local"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                Lưu giao dịch
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
