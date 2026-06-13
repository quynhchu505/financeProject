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
        backgroundColor: '#289E46', // Monarch income
      },
      {
        label: t('Chi'),
        data: reports.map((report) => report.expense),
        backgroundColor: '#CC2D24', // Monarch expense
      },
    ],
  }), [reports, t]);

  const forecastData = useMemo(() => ({
    labels: predictions.map((prediction) => prediction.month),
    datasets: [
      {
        label: t('Dự kiến thu'),
        data: predictions.map((prediction) => prediction.predicted_income),
        borderColor: '#289E46',
        backgroundColor: 'rgba(40, 158, 70, 0.18)',
        fill: true,
        tension: 0.35,
      },
      {
        label: t('Dự kiến chi'),
        data: predictions.map((prediction) => prediction.predicted_expense),
        borderColor: '#CC2D24',
        backgroundColor: 'rgba(204, 45, 36, 0.18)',
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
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-xl font-ui">
      <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between animate-fade-in-up">
        <h1 className="font-display text-[32px] sm:text-[40px] tracking-tight text-charcoal">{t('Báo cáo & Phân tích')}</h1>
        <div className="flex flex-wrap gap-sm">
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="rounded-standard border border-gray-border px-lg py-sm text-[15px] font-ui text-charcoal bg-white shadow-raised h-[40px] focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all outline-none">
            <option value={3}>{t('3 tháng')}</option>
            <option value={6}>{t('6 tháng')}</option>
            <option value={12}>{t('12 tháng')}</option>
          </select>
          <button onClick={() => downloadReport('csv')} className="inline-flex items-center gap-2 rounded-pill border border-gray-border px-lg py-sm text-[16px] font-normal text-charcoal hover:bg-offwhite-1 transition-colors shadow-raised h-[40px] bg-white">
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button onClick={() => downloadReport('pdf')} className="inline-flex items-center gap-2 rounded-pill bg-primary px-lg py-sm text-[16px] font-normal text-white hover:bg-primary-hover active:bg-primary transition-colors h-[40px] shadow-raised">
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {error && <div className="rounded-standard border border-semantic-error/20 bg-semantic-error/5 px-lg py-md text-[14px] text-semantic-error animate-fade-in">{error}</div>}

      <div className="grid gap-xl xl:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="rounded-card bg-white border border-gray-border p-xl shadow-elevated hover:shadow-high transition-shadow">
          <h2 className="mb-xl font-display text-[24px] text-charcoal">{t('Thu chi theo tháng')}</h2>
          <Bar
            data={incomeExpenseData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top', labels: { font: { family: 'Outfit' }, color: '#22201D' } },
                tooltip: { backgroundColor: '#22201D', titleFont: { family: 'Outfit' }, bodyFont: { family: 'Outfit' }, cornerRadius: 8, padding: 12 },
              },
              scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Outfit' }, color: '#686561' } },
                y: { border: { dash: [4, 4] }, grid: { color: '#EAE7E3' }, ticks: { font: { family: 'Outfit' }, color: '#686561' } },
              }
            }}
          />
        </div>

        <div className="rounded-card bg-white border border-gray-border p-xl shadow-elevated hover:shadow-high transition-shadow">
          <h2 className="mb-xs font-display text-[24px] text-charcoal">{t('Dự đoán dòng tiền (AI)')}</h2>
          <p className="mb-xl text-[14px] text-gray-dark font-ui">{t('Dự đoán thu chi các tháng tiếp theo')}</p>
          {predictions.length > 0 ? (
            <Line
              data={forecastData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top', labels: { font: { family: 'Outfit' }, color: '#22201D' } },
                  tooltip: { backgroundColor: '#22201D', titleFont: { family: 'Outfit' }, bodyFont: { family: 'Outfit' }, cornerRadius: 8, padding: 12 },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { family: 'Outfit' }, color: '#686561' } },
                  y: { border: { dash: [4, 4] }, grid: { color: '#EAE7E3' }, ticks: { font: { family: 'Outfit' }, color: '#686561' } },
                }
              }}
            />
          ) : (
            <div className="rounded-standard bg-offwhite-1 border border-gray-border px-md py-2xl text-center text-[15px] text-gray-medium font-ui">{t('Chưa đủ dữ liệu để dự đoán')}</div>
          )}
        </div>
      </div>

      <div className="space-y-xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {reports.map((report) => (
          <div key={report.month} className="rounded-card bg-white border border-gray-border p-xl shadow-elevated hover:shadow-high transition-shadow">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-ui font-medium text-[18px] text-charcoal">{report.month}</h3>
              <span className={`font-ui font-medium text-[18px] ${report.net >= 0 ? 'text-income' : 'text-expense'}`}>
                {report.net >= 0 ? '+' : ''}{formatCurrency(report.net)}
              </span>
            </div>
            <div className="grid gap-md md:grid-cols-3">
              <div className="rounded-standard bg-income/5 border border-income/20 p-md">
                <div className="text-[13px] text-income/80 font-medium">{t('Thu nhập')}</div>
                <div className="mt-xs font-display text-[20px] text-income tracking-tight">{formatCurrency(report.income)}</div>
              </div>
              <div className="rounded-standard bg-expense/5 border border-expense/20 p-md">
                <div className="text-[13px] text-expense/80 font-medium">{t('Chi tiêu')}</div>
                <div className="mt-xs font-display text-[20px] text-expense tracking-tight">{formatCurrency(report.expense)}</div>
              </div>
              <div className="rounded-standard bg-offwhite-2 border border-gray-border p-md">
                <div className="text-[13px] text-gray-dark font-medium">{t('Thu nhập ròng')}</div>
                <div className="mt-xs font-display text-[20px] text-charcoal tracking-tight">{formatCurrency(report.net)}</div>
              </div>
            </div>
            {report.categories.length > 0 && (
              <div className="mt-xl space-y-sm">
                {report.categories.map((category) => (
                  <div key={category.category_id} className="flex items-center gap-md text-[14px] bg-offwhite-1 rounded-standard p-sm border border-gray-border/50">
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.category_color }} />
                    <span className="flex-1 text-charcoal font-medium">{category.category_name}</span>
                    <span className="font-medium text-charcoal">{formatCurrency(category.total_amount)}</span>
                    <span className="w-16 text-right text-gray-dark">{category.percentage}%</span>
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
