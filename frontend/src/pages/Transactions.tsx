import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeftRight,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';

import { api } from '@/services/api';
import { Account, Category, PaginatedTransactions, Transaction, TransactionType } from '@/types';
import { useI18n } from '@/i18n';

type TransactionForm = {
  account_id: string;
  category_id: string;
  amount: string;
  transaction_type: Exclude<TransactionType, 'transfer'>;
  description: string;
  date: string;
};

const emptyTransactionForm = (): TransactionForm => ({
  account_id: '',
  category_id: '',
  amount: '',
  transaction_type: 'expense',
  description: '',
  date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
});

export default function Transactions() {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<PaginatedTransactions | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    q: '',
    account_id: '',
    category_id: '',
    transaction_type: '',
    start_date: '',
    end_date: '',
  });
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [form, setForm] = useState<TransactionForm>(emptyTransactionForm());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ category_id: number; category_name: string; confidence: number } | null>(null);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountForm, setAccountForm] = useState({ name: '', account_type: 'cash' });

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferForm, setTransferForm] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    description: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const accountTypeOptions = useMemo(
    () => [
      { value: 'cash', label: t('Tiền mặt') },
      { value: 'checking', label: t('Tài khoản ngân hàng') },
      { value: 'savings', label: t('Tiết kiệm') },
      { value: 'credit', label: t('Thẻ tín dụng') },
    ],
    [t]
  );

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [page, filters.account_id, filters.category_id, filters.transaction_type, filters.start_date, filters.end_date]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadTransactions();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    if (!showModal || !form.description.trim()) {
      setAiSuggestion(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setAiLoading(true);
        const result = await api.categorizeTransaction(form.description, form.amount ? Number(form.amount) : undefined);
        setAiSuggestion(result);
        setForm((current) => ({
          ...current,
          category_id: result.should_autofill && !current.category_id ? String(result.category_id) : current.category_id,
        }));
      } catch {
        setAiSuggestion(null);
      } finally {
        setAiLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [showModal, form.description, form.amount]);

  const loadReferenceData = async () => {
    try {
      const [cats, accs] = await Promise.all([api.getCategories(), api.getAccounts()]);
      setCategories(cats as Category[]);
      setAccounts(accs as Account[]);
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions({
        q: filters.q,
        account_id: filters.account_id ? Number(filters.account_id) : undefined,
        category_id: filters.category_id ? Number(filters.category_id) : undefined,
        transaction_type: filters.transaction_type || undefined,
        start_date: filters.start_date ? new Date(filters.start_date).toISOString() : undefined,
        end_date: filters.end_date ? new Date(filters.end_date).toISOString() : undefined,
        page,
        page_size: 10,
      });
      setTransactions(data as PaginatedTransactions);
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const resetTransactionModal = () => {
    setEditingTransaction(null);
    setForm(emptyTransactionForm());
    setAiSuggestion(null);
    setShowModal(false);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setForm({
      account_id: String(transaction.account_id),
      category_id: transaction.category_id ? String(transaction.category_id) : '',
      amount: String(transaction.amount),
      transaction_type: (transaction.transaction_type === 'income' ? 'income' : 'expense'),
      description: transaction.description || '',
      date: format(new Date(transaction.date), "yyyy-MM-dd'T'HH:mm"),
    });
    setShowModal(true);
  };

  const notifyDataChanged = () => {
    window.dispatchEvent(new Event('finance:data-changed'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        account_id: Number(form.account_id),
        category_id: form.category_id ? Number(form.category_id) : undefined,
        amount: Number(form.amount),
        transaction_type: form.transaction_type,
        description: form.description || undefined,
        date: new Date(form.date).toISOString(),
        is_ai_categorized: !!aiSuggestion && !!form.category_id && Number(form.category_id) === aiSuggestion.category_id,
        ai_confidence: aiSuggestion?.confidence,
      };

      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, payload);
        setMessage(t('Lưu thay đổi'));
      } else {
        await api.createTransaction(payload);
        setMessage(t('Lưu giao dịch'));
      }

      notifyDataChanged();
      resetTransactionModal();
      await loadTransactions();
      await loadReferenceData();
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('Xóa giao dịch này?'))) return;
    try {
      await api.deleteTransaction(id);
      setMessage(t('Xóa'));
      notifyDataChanged();
      await loadTransactions();
      await loadReferenceData();
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountLoading(true);
    setAccountError('');
    try {
      if (editingAccount) {
        await api.updateAccount(editingAccount.id, {
          name: accountForm.name,
          account_type: accountForm.account_type,
        });
      } else {
        await api.createAccount(accountForm);
      }
      setShowAccountModal(false);
      setEditingAccount(null);
      setAccountForm({ name: '', account_type: 'cash' });
      await loadReferenceData();
    } catch (err: any) {
      setAccountError(err.message || t('Có lỗi xảy ra'));
    } finally {
      setAccountLoading(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm(t('Xóa tài khoản này? Tất cả giao dịch liên quan sẽ bị xóa.'))) return;
    try {
      await api.deleteAccount(id);
      await loadReferenceData();
      await loadTransactions();
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferLoading(true);
    setTransferError('');
    try {
      await api.transfer({
        from_account_id: Number(transferForm.from_account_id),
        to_account_id: Number(transferForm.to_account_id),
        amount: Number(transferForm.amount),
        description: transferForm.description || undefined,
        date: new Date(transferForm.date).toISOString(),
      });
      setShowTransferModal(false);
      setTransferForm({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        description: '',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
      await loadReferenceData();
      await loadTransactions();
    } catch (err: any) {
      setTransferError(err.message || t('Có lỗi xảy ra'));
    } finally {
      setTransferLoading(false);
    }
  };

  const totalPages = transactions?.pages || 1;

  return (
    <div className="space-y-xl">
      <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between animate-fade-in-up">
        <h1 className="font-display text-[32px] sm:text-[40px] tracking-tight text-charcoal">{t('Giao dịch')}</h1>
        <div className="flex flex-wrap gap-sm">
          <button
            onClick={() => setShowAccountModal(true)}
            className="inline-flex items-center gap-2 rounded-pill bg-white border border-gray-border px-lg py-sm text-[16px] font-ui text-charcoal hover:bg-offwhite-1 transition-colors shadow-raised h-[36px]"
          >
            <Wallet className="h-4 w-4" />
            {t('Tạo tài khoản')}
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center gap-2 rounded-pill bg-white border border-gray-border px-lg py-sm text-[16px] font-ui text-charcoal hover:bg-offwhite-1 transition-colors shadow-raised h-[36px]"
          >
            <ArrowLeftRight className="h-4 w-4" />
            {t('Chuyển tiền')}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-lg py-sm text-[16px] font-ui text-white hover:bg-primary-hover active:bg-primary transition-colors h-[36px]"
          >
            <Plus className="h-4 w-4" />
            {t('Thêm giao dịch')}
          </button>
        </div>
      </div>

      {message && <div className="rounded-standard border border-income/20 bg-income/5 px-lg py-md text-[14px] text-income animate-fade-in">{message}</div>}
      {error && <div className="rounded-standard border border-semantic-error/20 bg-semantic-error/5 px-lg py-md text-[14px] text-semantic-error animate-fade-in">{error}</div>}

      <section className="grid gap-md rounded-card bg-white border border-gray-border p-xl shadow-elevated md:grid-cols-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <label className="md:col-span-2">
          <span className="sr-only">{t('Mô tả')}</span>
          <div className="flex items-center gap-2 rounded-standard border border-gray-border px-md py-sm focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10 shadow-raised h-[40px] bg-white transition-all">
            <Search className="h-4 w-4 text-gray-dark" />
            <input
              value={filters.q}
              onChange={(e) => { setPage(1); setFilters((prev) => ({ ...prev, q: e.target.value })); }}
              placeholder={t('Mô tả')}
              className="w-full bg-transparent text-[15px] text-charcoal placeholder-gray-medium outline-none font-ui"
            />
          </div>
        </label>

        <select
          value={filters.account_id}
          onChange={(e) => { setPage(1); setFilters((prev) => ({ ...prev, account_id: e.target.value })); }}
          className="rounded-standard border border-gray-border px-md py-sm text-[15px] text-charcoal bg-white shadow-raised h-[40px] font-ui outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
        >
          <option value="">{t('Chọn tài khoản')}</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>

        <select
          value={filters.category_id}
          onChange={(e) => { setPage(1); setFilters((prev) => ({ ...prev, category_id: e.target.value })); }}
          className="rounded-standard border border-gray-border px-md py-sm text-[15px] text-charcoal bg-white shadow-raised h-[40px] font-ui outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
        >
          <option value="">{t('Chọn danh mục')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <select
          value={filters.transaction_type}
          onChange={(e) => { setPage(1); setFilters((prev) => ({ ...prev, transaction_type: e.target.value })); }}
          className="rounded-standard border border-gray-border px-md py-sm text-[15px] text-charcoal bg-white shadow-raised h-[40px] font-ui outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
        >
          <option value="">{t('Hành động')}</option>
          <option value="expense">{t('Chi tiêu')}</option>
          <option value="income">{t('Thu nhập')}</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setPage(1);
            setFilters({ q: '', account_id: '', category_id: '', transaction_type: '', start_date: '', end_date: '' });
          }}
          className="rounded-standard border border-gray-border px-md py-sm text-[15px] text-charcoal bg-white shadow-raised hover:bg-offwhite-1 h-[40px] font-ui transition-colors"
        >
          {t('Hủy')}
        </button>
      </section>

      <section className="grid gap-md md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {accounts.map((account) => (
          <div key={account.id} className="rounded-card border border-gray-border bg-white p-xl shadow-elevated hover:shadow-high transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-ui font-medium text-[16px] text-charcoal">{account.name}</div>
                <div className="text-[14px] text-gray-dark font-ui">
                  {accountTypeOptions.find((item) => item.value === account.account_type)?.label || account.account_type}
                </div>
                <div className="mt-sm font-display text-[24px] text-charcoal tracking-tight">{formatCurrency(account.balance)}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingAccount(account);
                    setAccountForm({ name: account.name, account_type: account.account_type });
                    setShowAccountModal(true);
                  }}
                  className="rounded-standard p-1.5 text-gray-medium hover:bg-offwhite-1 hover:text-charcoal transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="rounded-standard p-1.5 text-gray-medium hover:bg-semantic-error/5 hover:text-semantic-error transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-card bg-white border border-gray-border shadow-elevated animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : transactions && transactions.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-ui">
                <thead>
                  <tr className="border-b border-gray-border text-left text-[12px] uppercase tracking-widest text-gray-dark">
                    <th className="px-xl py-md font-medium">{t('Ngày')}</th>
                    <th className="px-xl py-md font-medium">{t('Mô tả')}</th>
                    <th className="px-xl py-md font-medium">{t('Danh mục')}</th>
                    <th className="px-xl py-md text-right font-medium">{t('Số tiền')}</th>
                    <th className="px-xl py-md text-right font-medium">{t('Hành động')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.items.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-border last:border-0 hover:bg-offwhite-1 transition-colors">
                      <td className="px-xl py-md whitespace-nowrap text-[15px] text-charcoal">{format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}</td>
                      <td className="px-xl py-md min-w-[200px]">
                        <div className="font-medium text-[15px] text-charcoal">{tx.description || '—'}</div>
                        {tx.is_ai_categorized && tx.ai_confidence != null && (
                          <div className="text-[12px] text-primary mt-1">AI {Math.round(tx.ai_confidence * 100)}%</div>
                        )}
                      </td>
                      <td className="px-xl py-md">
                        {tx.category ? (
                          <span className="inline-flex items-center rounded-pill px-2.5 py-0.5 text-[13px] font-medium text-white shadow-raised" style={{ backgroundColor: tx.category.color }}>
                            {tx.category.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className={`px-xl py-md text-right font-medium text-[15px] whitespace-nowrap ${tx.transaction_type === 'income' ? 'text-income' : 'text-charcoal'}`}>
                        {tx.transaction_type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-xl py-md">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(tx)} className="rounded-standard p-1.5 text-gray-medium hover:bg-offwhite-2 hover:text-charcoal transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} className="rounded-standard p-1.5 text-gray-medium hover:bg-semantic-error/10 hover:text-semantic-error transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-xl border-t border-gray-border flex items-center justify-between font-ui">
              <p className="text-[14px] text-gray-dark">
                {transactions.total} giao dịch
              </p>
              <div className="flex items-center gap-sm">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-pill border border-gray-border px-lg py-1 text-[14px] text-charcoal disabled:opacity-50 hover:bg-offwhite-1 transition-colors shadow-raised"
                >
                  Prev
                </button>
                <span className="text-[14px] text-gray-dark px-md">{page}/{Math.max(totalPages, 1)}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-pill border border-gray-border px-lg py-1 text-[14px] text-charcoal disabled:opacity-50 hover:bg-offwhite-1 transition-colors shadow-raised"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-2xl text-center text-[15px] text-gray-medium font-ui">{t('Chưa có giao dịch nào.')}</div>
        )}
      </section>

      {/* Modals are adapted to use Finance styling via Modal component updates */}
      {showModal && (
        <Modal title={editingTransaction ? t('Lưu thay đổi') : t('Thêm giao dịch')} onClose={resetTransactionModal}>
          <form onSubmit={handleSubmit} className="space-y-lg font-ui">
            <div className="grid grid-cols-2 gap-xs rounded-standard bg-offwhite-2 p-1 border border-gray-border shadow-raised">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, transaction_type: 'expense' }))}
                className={`rounded-[4px] px-3 py-2 text-[15px] font-medium transition-colors ${form.transaction_type === 'expense' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-dark hover:text-charcoal'}`}
              >
                {t('Chi tiêu')}
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, transaction_type: 'income' }))}
                className={`rounded-[4px] px-3 py-2 text-[15px] font-medium transition-colors ${form.transaction_type === 'income' ? 'bg-white text-income shadow-sm' : 'text-gray-dark hover:text-charcoal'}`}
              >
                {t('Thu nhập')}
              </button>
            </div>

            <select required value={form.account_id} onChange={(e) => setForm((prev) => ({ ...prev, account_id: e.target.value }))} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal">
              <option value="">{t('Chọn tài khoản')}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>

            <div className="grid grid-cols-[1fr_auto] gap-sm">
              <select value={form.category_id} onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal">
                <option value="">{t('Chọn danh mục')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="flex items-center justify-center w-[40px] rounded-standard border border-gray-border bg-offwhite-1 text-primary shadow-raised">
                {aiLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Sparkles className="h-4 w-4" />}
              </div>
            </div>
            {aiSuggestion && (
              <div className="rounded-standard bg-primary/5 px-md py-sm text-[13px] text-primary border border-primary/10">
                Gợi ý AI: {aiSuggestion.category_name} ({Math.round(aiSuggestion.confidence * 100)}%)
              </div>
            )}

            <input type="number" min="0" step="1000" required value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder={t('Số tiền')} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal placeholder-gray-medium" />
            <input type="text" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder={t('Mô tả')} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal placeholder-gray-medium" />
            <input type="datetime-local" required value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal" />

            <button type="submit" className="w-full rounded-pill bg-primary px-lg py-sm text-[16px] font-normal text-white hover:bg-primary-hover active:bg-primary h-[40px] transition-colors mt-xl">
              {editingTransaction ? t('Lưu thay đổi') : t('Lưu giao dịch')}
            </button>
          </form>
        </Modal>
      )}

      {showAccountModal && (
        <Modal title={editingAccount ? t('Sửa tài khoản') : t('Tạo tài khoản mới')} onClose={() => { setShowAccountModal(false); setEditingAccount(null); setAccountForm({ name: '', account_type: 'cash' }); }}>
          <form onSubmit={handleCreateAccount} className="space-y-lg font-ui">
            <input value={accountForm.name} onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))} placeholder={t('Tên tài khoản')} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal placeholder-gray-medium" />
            <select value={accountForm.account_type} onChange={(e) => setAccountForm((prev) => ({ ...prev, account_type: e.target.value }))} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal">
              {accountTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            {accountError && <div className="rounded-standard bg-semantic-error/5 px-md py-sm text-[14px] text-semantic-error border border-semantic-error/20">{accountError}</div>}
            <button disabled={accountLoading} type="submit" className="w-full rounded-pill bg-charcoal px-lg py-sm text-[16px] font-normal text-white hover:bg-primary-hover active:bg-primary h-[40px] transition-colors disabled:opacity-50 mt-xl">
              {accountLoading ? t('Đang xử lý...') : (editingAccount ? t('Lưu thay đổi') : t('Tạo tài khoản'))}
            </button>
          </form>
        </Modal>
      )}

      {showTransferModal && (
        <Modal title={t('Chuyển tiền')} onClose={() => setShowTransferModal(false)}>
          <form onSubmit={handleTransfer} className="space-y-lg font-ui">
            <select required value={transferForm.from_account_id} onChange={(e) => setTransferForm((prev) => ({ ...prev, from_account_id: e.target.value }))} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal">
              <option value="">{t('Chọn tài khoản nguồn')}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
            <select required value={transferForm.to_account_id} onChange={(e) => setTransferForm((prev) => ({ ...prev, to_account_id: e.target.value }))} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal">
              <option value="">{t('Chọn tài khoản đích')}</option>
              {accounts.filter((account) => String(account.id) !== transferForm.from_account_id).map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
            <input type="number" min="0" step="1000" required value={transferForm.amount} onChange={(e) => setTransferForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder={t('Số tiền')} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal placeholder-gray-medium" />
            <input type="text" value={transferForm.description} onChange={(e) => setTransferForm((prev) => ({ ...prev, description: e.target.value }))} placeholder={t('Mô tả (tùy chọn)')} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal placeholder-gray-medium" />
            <input type="datetime-local" required value={transferForm.date} onChange={(e) => setTransferForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full rounded-standard border border-gray-border px-lg py-sm text-[15px] bg-white h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised outline-none transition-all text-charcoal" />
            {transferError && <div className="rounded-standard bg-semantic-error/5 px-md py-sm text-[14px] text-semantic-error border border-semantic-error/20">{transferError}</div>}
            <button disabled={transferLoading} type="submit" className="w-full rounded-pill bg-charcoal px-lg py-sm text-[16px] font-normal text-white hover:bg-primary-hover active:bg-primary h-[40px] transition-colors disabled:opacity-50 mt-xl">
              {transferLoading ? t('Đang xử lý...') : t('Chuyển tiền')}
            </button>
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
