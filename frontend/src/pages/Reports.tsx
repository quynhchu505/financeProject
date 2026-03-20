import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { MonthlyReport, CashFlowPrediction } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function Reports() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [predictions, setPredictions] = useState<CashFlowPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getMonthlyReports(6),
      api.getCashFlowPrediction(3),
    ]).then(([r, p]) => {
      setReports(r as MonthlyReport[]);
      setPredictions(p as CashFlowPrediction[]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const chartData = reports.map((r) => ({
    month: r.month.slice(5),
    Thu: r.income,
    Chi: r.expense,
    'Thu nhập ròng': r.net,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Phân tích</h1>

      {/* Income vs Expense chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Thu chi theo tháng</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Chi" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
        )}
      </div>

      {/* Cash flow prediction */}
      {predictions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-1">Dự đoán dòng tiền (AI)</h3>
          <p className="text-sm text-gray-500 mb-4">Dự đoán thu chi các tháng tiếp theo dựa trên lịch sử giao dịch</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={predictions.map((p) => ({
              month: p.month.slice(5),
              'Dự kiến thu': p.predicted_income,
              'Dự kiến chi': p.predicted_expense,
            }))}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="Dự kiến thu" stroke="#22c55e" strokeWidth={2} dot />
              <Line type="monotone" dataKey="Dự kiến chi" stroke="#ef4444" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex gap-4 text-sm">
            {predictions.map((p, i) => (
              <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg">
                <div className="text-gray-500">{p.month}</div>
                <div className="text-xs text-gray-400">Độ tin cậy: {p.confidence}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly breakdown */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.month} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">{report.month}</h4>
              <span className={`text-sm font-medium ${report.net >= 0 ? 'text-income' : 'text-expense'}`}>
                {report.net >= 0 ? '+' : ''}{formatCurrency(report.net)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-green-600 font-medium">Thu nhập</div>
                <div className="text-lg font-bold text-income">{formatCurrency(report.income)}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-red-600 font-medium">Chi tiêu</div>
                <div className="text-lg font-bold text-expense">{formatCurrency(report.expense)}</div>
              </div>
            </div>
            {report.categories.length > 0 && (
              <div className="space-y-2">
                {report.categories.map((cat) => (
                  <div key={cat.category_id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.category_color }} />
                    <span className="text-sm text-gray-600 flex-1">{cat.category_name}</span>
                    <span className="text-sm font-medium text-gray-800">{formatCurrency(cat.total_amount)}</span>
                    <span className="text-xs text-gray-400 w-12 text-right">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}
