import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  BarElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import { api } from '@/services/api';
import { CashFlowPrediction, MonthlyReport } from '@/types';
import { useI18n } from '@/i18n';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Reports() {
  const { t } = useI18n();
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [predictions, setPredictions] = useState<CashFlowPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [months]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportData, predictionData] = await Promise.all([
        api.getMonthlyReports(months),
        api.getCashFlowPrediction(Math.min(3, months)),
      ]);
      setReports(reportData as MonthlyReport[]);
      setPredictions(predictionData as CashFlowPrediction[]);
      setError(null);
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const incomeExpenseData = useMemo(() => ({
    labels: reports.map((report) => report.month),
    datasets: [
      {
        label: t('Thu'),
        data: reports.map((report) => report.income),
        backgroundColor: '#22c55e',
      },
      {
        label: t('Chi'),
        data: reports.map((report) => report.expense),
        backgroundColor: '#ef4444',
      },
    ],
  }), [reports, t]);

  const forecastData = useMemo(() => ({
    labels: predictions.map((prediction) => prediction.month),
    datasets: [
      {
        label: t('Dự kiến thu'),
        data: predictions.map((prediction) => prediction.predicted_income),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.18)',
        fill: true,
        tension: 0.35,
      },
      {
        label: t('Dự kiến chi'),
        data: predictions.map((prediction) => prediction.predicted_expense),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.18)',
        fill: true,
        tension: 0.35,
      },
    ],
  }), [predictions, t]);

  const downloadReport = async (format: 'csv' | 'pdf') => {
    const blob = await api.exportReport(format, months);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `finance-report.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('Báo cáo & Phân tích')}</h1>
        <div className="flex flex-wrap gap-2">
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value={3}>3 tháng</option>
            <option value={6}>6 tháng</option>
            <option value={12}>12 tháng</option>
          </select>
          <button onClick={() => downloadReport('csv')} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button onClick={() => downloadReport('pdf')} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700">
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">{t('Thu chi theo tháng')}</h2>
          <Bar
            data={incomeExpenseData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
              },
            }}
          />
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">{t('Dự đoán dòng tiền (AI)')}</h2>
          <p className="mb-4 text-sm text-gray-500">{t('Dự đoán thu chi các tháng tiếp theo')}</p>
          {predictions.length > 0 ? (
            <Line
              data={forecastData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                },
              }}
            />
          ) : (
            <div className="rounded-lg bg-gray-50 px-4 py-10 text-center text-sm text-gray-400">Chưa đủ dữ liệu để dự đoán</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.month} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{report.month}</h3>
              <span className={`font-semibold ${report.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {report.net >= 0 ? '+' : ''}{formatCurrency(report.net)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-green-50 p-3">
                <div className="text-xs text-green-700">{t('Thu nhập')}</div>
                <div className="mt-1 font-semibold text-green-700">{formatCurrency(report.income)}</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <div className="text-xs text-red-700">{t('Chi tiêu')}</div>
                <div className="mt-1 font-semibold text-red-700">{formatCurrency(report.expense)}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">{t('Thu nhập ròng')}</div>
                <div className="mt-1 font-semibold text-gray-800">{formatCurrency(report.net)}</div>
              </div>
            </div>
            {report.categories.length > 0 && (
              <div className="mt-4 space-y-2">
                {report.categories.map((category) => (
                  <div key={category.category_id} className="flex items-center gap-3 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.category_color }} />
                    <span className="flex-1 text-gray-700">{category.category_name}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(category.total_amount)}</span>
                    <span className="w-16 text-right text-gray-500">{category.percentage}%</span>
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
