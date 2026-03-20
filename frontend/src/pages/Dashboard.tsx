import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { DashboardStats } from '@/types';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CATEGORY_ICONS: Record<string, string> = {
  'Ăn uống': '🍽️',
  'Di chuyển': '🚗',
  'Mua sắm': '🛒',
  'Giải trí': '🎮',
  'Nhà cửa': '🏠',
  'Y tế': '💊',
  'Giáo dục': '📚',
  'Tiết kiệm': '💰',
  'Lương': '💵',
  'Đầu tư': '📈',
  'Khác': '📦',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then((data) => setStats(data as DashboardStats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) return null;

  const pieData = stats.top_categories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    fill: cat.color,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng số dư"
          value={formatCurrency(stats.total_balance)}
          icon={Wallet}
          color="bg-primary-500"
        />
        <StatCard
          label="Thu nhập tháng"
          value={formatCurrency(stats.monthly_income)}
          icon={TrendingUp}
          color="bg-income"
        />
        <StatCard
          label="Chi tiêu tháng"
          value={formatCurrency(stats.monthly_expense)}
          icon={TrendingDown}
          color="bg-expense"
        />
        <StatCard
          label="Tỷ lệ tiết kiệm"
          value={`${stats.savings_rate}%`}
          icon={PiggyBank}
          color="bg-amber-500"
        />
      </div>

      {/* Budget alerts */}
      {stats.budget_alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Cảnh báo ngân sách</h3>
          </div>
          <div className="space-y-2">
            {stats.budget_alerts.map((alert) => (
              <div key={alert.budget.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <span className="font-medium text-gray-800">{alert.budget.category.name}</span>
                  <div className="text-sm text-gray-500">
                    Đã chi {formatCurrency(alert.spent)} / {formatCurrency(alert.budget.amount)}
                  </div>
                </div>
                <span className={`text-sm font-medium ${alert.percentage >= 100 ? 'text-red-600' : 'text-amber-600'}`}>
                  {alert.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category pie chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Chi tiêu theo danh mục</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              Chưa có dữ liệu chi tiêu
            </div>
          )}
          {pieData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {pieData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.fill }} />
                  <span className="text-gray-600">{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Giao dịch gần đây</h3>
            <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recent_transactions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Chưa có giao dịch nào</div>
            ) : (
              stats.recent_transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.transaction_type === 'income' ? 'bg-green-100 text-income' : 'bg-red-100 text-expense'
                    }`}>
                      {tx.transaction_type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{tx.category?.name || 'Khác'}</div>
                      <div className="text-sm text-gray-500">{tx.description || '—'}</div>
                    </div>
                  </div>
                  <span className={`font-medium ${tx.transaction_type === 'income' ? 'text-income' : 'text-expense'}`}>
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

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className={`${color} p-2.5 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-lg font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}
