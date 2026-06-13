import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { DashboardStats } from '@/types';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/i18n';

export default function Dashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState(0);
  const [feedbackLoadingId, setFeedbackLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const load = () => {
      api.getDashboardStats()
        .then((data) => setStats(data as DashboardStats))
        .catch(console.error)
        .finally(() => setLoading(false));
    };
    load();
    window.addEventListener('finance:data-changed', load);
    return () => window.removeEventListener('finance:data-changed', load);
  }, []);

  useEffect(() => {
    if (!loading && stats) {
      const timer = setTimeout(() => setVisibleCards(4), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, stats]);

  const submitAnomalyFeedback = async (alertId: number, verdict: 'normal' | 'investigate') => {
    try {
      setFeedbackLoadingId(alertId);
      await api.sendAnomalyFeedback(alertId, verdict);
      const data = await api.getDashboardStats();
      setStats(data as DashboardStats);
    } catch (error) {
      console.error(error);
    } finally {
      setFeedbackLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-xl animate-fade-in">
        <h1 className="font-display text-[32px] sm:text-[40px] text-charcoal">Tổng quan</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-xl">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-card border border-gray-border shadow-elevated p-xl h-[104px]">
              <div className="skeleton h-full w-full rounded-standard" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = stats.top_categories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color,
  }));

  return (
    <div className="space-y-2xl">
      <h1 className="font-display text-[32px] sm:text-[40px] tracking-tight text-charcoal animate-fade-in-up">{t('Tổng quan')}</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-xl stagger-children">
        <div
          className={`bg-white rounded-card border border-gray-border shadow-elevated p-xl transition-all duration-500 hover:shadow-high ${
            visibleCards >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-md">
            <div className="bg-beige-light p-3 rounded-standard flex-shrink-0">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-ui text-gray-dark truncate">{t('Tổng số dư')}</div>
              <div className="font-display text-[24px] tracking-tight text-charcoal truncate">{formatCurrency(stats.total_balance)}</div>
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-card border border-gray-border shadow-elevated p-xl transition-all duration-500 hover:shadow-high ${
            visibleCards >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-md">
            <div className="bg-income/10 p-3 rounded-standard flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-income" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-ui text-gray-dark truncate">{t('Thu nhập tháng')}</div>
              <div className="font-display text-[24px] tracking-tight text-income truncate">{formatCurrency(stats.monthly_income)}</div>
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-card border border-gray-border shadow-elevated p-xl transition-all duration-500 hover:shadow-high ${
            visibleCards >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-md">
            <div className="bg-expense/10 p-3 rounded-standard flex-shrink-0">
              <TrendingDown className="w-6 h-6 text-expense" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-ui text-gray-dark truncate">{t('Chi tiêu tháng')}</div>
              <div className="font-display text-[24px] tracking-tight text-expense truncate">{formatCurrency(stats.monthly_expense)}</div>
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-card border border-gray-border shadow-elevated p-xl transition-all duration-500 hover:shadow-high ${
            visibleCards >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-md">
            <div className="bg-semantic-warning/10 p-3 rounded-standard flex-shrink-0">
              <PiggyBank className="w-6 h-6 text-semantic-warning" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-ui text-gray-dark truncate">{t('Tỷ lệ tiết kiệm')}</div>
              <div className="font-display text-[24px] tracking-tight text-semantic-warning truncate">{stats.savings_rate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget alerts */}
      {stats.budget_alerts.length > 0 && (
        <div className="bg-semantic-warning/5 border border-semantic-warning/20 rounded-card p-xl animate-fade-in-up">
          <div className="flex items-center gap-2 mb-md">
            <AlertTriangle className="w-5 h-5 text-semantic-warning flex-shrink-0" />
            <h3 className="font-ui font-medium text-[18px] text-charcoal">{t('Cảnh báo ngân sách')}</h3>
          </div>
          <div className="space-y-sm">
            {stats.budget_alerts.map((alert, idx) => (
              <div key={alert.budget.id} className="flex items-center justify-between bg-white rounded-standard border border-gray-border p-md hover:shadow-raised transition-shadow animate-fade-in">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-[16px] text-charcoal">{alert.budget.category.name}</span>
                  <div className="text-[14px] text-gray-dark mt-1">
                    {t('Đã chi')} <span className="font-medium text-charcoal">{formatCurrency(alert.spent)}</span> / {formatCurrency(alert.budget.amount)}
                  </div>
                </div>
                <span className={`text-[16px] font-medium ml-xl flex-shrink-0 ${alert.percentage >= 100 ? 'text-semantic-error' : 'text-semantic-warning'}`}>
                  {alert.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly alerts */}
      {stats.anomaly_alerts.length > 0 && (
        <div className="bg-semantic-error/5 border border-semantic-error/20 rounded-card p-xl animate-fade-in-up">
          <div className="flex items-center gap-2 mb-md">
            <AlertTriangle className="w-5 h-5 text-semantic-error flex-shrink-0" />
            <h3 className="font-ui font-medium text-[18px] text-charcoal">Cảnh báo bất thường</h3>
          </div>
          <div className="space-y-sm">
            {stats.anomaly_alerts.map((alert) => (
              <div key={alert.id} className="rounded-standard bg-white border border-gray-border p-md">
                <div className="font-medium text-[16px] text-charcoal">{alert.title}</div>
                <div className="text-[14px] text-gray-dark mt-1">{alert.message}</div>
                <div className="mt-md flex flex-wrap gap-sm">
                  <button
                    type="button"
                    onClick={() => submitAnomalyFeedback(alert.id, 'normal')}
                    disabled={feedbackLoadingId === alert.id}
                    className="rounded-pill border border-gray-border px-lg py-sm text-[14px] font-medium text-charcoal hover:bg-offwhite-1 hover:border-gray-medium transition-colors disabled:opacity-50"
                  >
                    {t('Bình thường')}
                  </button>
                  <button
                    type="button"
                    onClick={() => submitAnomalyFeedback(alert.id, 'investigate')}
                    disabled={feedbackLoadingId === alert.id}
                    className="rounded-pill border border-semantic-error px-lg py-sm text-[14px] font-medium text-semantic-error hover:bg-semantic-error/5 transition-colors disabled:opacity-50"
                  >
                    {t('Cần điều tra')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Category pie chart */}
        <div className="bg-white rounded-card border border-gray-border shadow-elevated p-xl sm:p-2xl hover:shadow-high transition-shadow animate-fade-in-up">
          <h3 className="font-display text-[24px] text-charcoal mb-xl">{t('Chi tiêu theo danh mục')}</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #DCD9D6', boxShadow: '0px 10px 15px -3px rgba(34, 32, 29, 0.1)' }}
                  itemStyle={{ color: '#22201D', fontFamily: 'Outfit' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-medium font-ui text-[16px]">
              {t('Chưa có dữ liệu chi tiêu')}
            </div>
          )}
          {pieData.length > 0 && (
            <div className="mt-xl grid grid-cols-2 gap-md">
              {pieData.map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-sm animate-fade-in">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-ui text-[15px] text-charcoal truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-card border border-gray-border shadow-elevated p-xl sm:p-2xl hover:shadow-high transition-shadow animate-fade-in-up flex flex-col">
          <div className="flex items-center justify-between mb-xl">
            <h3 className="font-display text-[24px] text-charcoal">{t('Giao dịch gần đây')}</h3>
            <Link to="/transactions" className="font-ui text-[15px] text-primary hover:text-primary-hover flex items-center gap-1 font-medium transition-colors">
              {t('Xem tất cả')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-0 flex-1">
            {stats.recent_transactions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-medium font-ui text-[16px]">
                {t('Chưa có giao dịch nào')}
              </div>
            ) : (
              stats.recent_transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-md border-b border-gray-border last:border-0 hover:bg-offwhite-1 transition-colors -mx-xl px-xl sm:-mx-2xl sm:px-2xl"
                >
                  <div className="flex items-center gap-md min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-standard flex items-center justify-center flex-shrink-0 ${
                      tx.transaction_type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                    }`}>
                      {tx.transaction_type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-ui font-medium text-[16px] text-charcoal truncate">{tx.category?.name || '—'}</div>
                      <div className="font-ui text-[14px] text-gray-dark truncate">{tx.description || '—'}</div>
                    </div>
                  </div>
                  <span className={`font-ui font-medium text-[16px] flex-shrink-0 ml-xl ${tx.transaction_type === 'income' ? 'text-income' : 'text-charcoal'}`}>
                    {tx.transaction_type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}
