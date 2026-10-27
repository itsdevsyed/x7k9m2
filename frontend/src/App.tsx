import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Wind,
  Activity,
  AlertTriangle,
  CalendarDays,
  TrendingUp,
  RefreshCw,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  Clock3,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const API_URL = 'https://x7k9m2-1.onrender.com';

const DEFAULT_MONTH = '2026-01';

interface DataPoint {
  startTime: string;
  actual: number;
  forecast: number;
  error: number;
}

interface AccuracyMetrics {
  mae_mw: number;
  rmse_mw: number;
  bias_mw: number;
  month: string;
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  accent: string;
}

function App() {
  const [selectedDate, setSelectedDate] = useState(
    `${DEFAULT_MONTH}-15`
  );

  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [metrics, setMetrics] = useState<AccuracyMetrics | null>(null);

  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [metricsError, setMetricsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (date: string) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.get(
        `${API_URL}/api/forecast`,
        {
          params: {
            target_date: date,
          },
          timeout: 30000,
        }
      );

      const points = response.data.data_points;

      if (!Array.isArray(points)) {
        throw new Error('Unexpected forecast response format.');
      }

      setChartData(points);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching forecast:', error);

      setChartData([]);
      setErrorMessage(
        axios.isAxiosError(error) && error.code === 'ECONNABORTED'
          ? 'The request timed out. The backend may be starting up. Please retry.'
          : 'Unable to load forecast data. Check the backend status and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(false);

    try {
      const response = await axios.get(
        `${API_URL}/api/accuracy`,
        {
          params: {
            month: DEFAULT_MONTH,
          },
          timeout: 30000,
        }
      );

      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching accuracy metrics:', error);
      setMetrics(null);
      setMetricsError(true);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    void fetchMetrics();
  }, []);

  const refreshDashboard = () => {
    void fetchData(selectedDate);
    void fetchMetrics();
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined || !Number.isFinite(value)) {
      return '—';
    }

    return value.toLocaleString('en-GB', {
      maximumFractionDigits: 2,
    });
  };

  const formatTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
    });
  };

  const averageActual =
    chartData.length > 0
      ? chartData.reduce((sum, point) => sum + point.actual, 0) /
        chartData.length
      : null;

  const chartDifference =
    chartData.length > 0
      ? chartData.reduce(
          (sum, point) => sum + Math.abs(point.actual - point.forecast),
          0
        ) / chartData.length
      : null;

  const displayedDate = new Date(`${selectedDate}T12:00:00`);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <Wind size={25} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                Wind<span className="text-emerald-600">Metrics</span>
              </p>
              <p className="text-xs text-slate-500">
                UK Energy Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold text-emerald-800">
              Forecast Analytics
            </span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Page heading */}
        <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              RENEWABLE ENERGY ANALYTICS
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Wind Power Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Compare day-ahead wind generation forecasts against actual
              output and understand forecast accuracy for electricity
              procurement decisions.
            </p>
          </div>

          <button
            onClick={refreshDashboard}
            disabled={loading || metricsLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
          >
            <RefreshCw
              size={16}
              className={loading || metricsLoading ? 'animate-spin' : ''}
            />
            Refresh data
          </button>
        </section>

        {/* Reporting period banner */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/10 p-3 text-emerald-300">
                <Activity size={25} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300">
                  Historical reporting period
                </p>

                <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                  January 2026
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Half-hourly forecast accuracy analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <CalendarDays className="text-emerald-300" size={20} />

              <div>
                <p className="text-xs text-slate-400">Selected date</p>
                <p className="font-semibold text-white">
                  {Number.isNaN(displayedDate.getTime())
                    ? selectedDate
                    : format(displayedDate, 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI cards */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Mean Absolute Error"
            value={
              metricsLoading
                ? '...'
                : metrics
                  ? formatNumber(metrics.mae_mw)
                  : '—'
            }
            subtitle="Average absolute error"
            icon={<Activity size={21} />}
            accent="emerald"
          />

          <KPICard
            title="Root Mean Square Error"
            value={
              metricsLoading
                ? '...'
                : metrics
                  ? formatNumber(metrics.rmse_mw)
                  : '—'
            }
            subtitle="Penalizes larger errors"
            icon={<AlertTriangle size={21} />}
            accent="amber"
          />

          <KPICard
            title="Forecast Bias"
            value={
              metricsLoading
                ? '...'
                : metrics
                  ? formatNumber(metrics.bias_mw)
                  : '—'
            }
            subtitle="Forecast minus actual"
            icon={<TrendingUp size={21} />}
            accent="blue"
          />

          <KPICard
            title="Average Actual Output"
            value={
              loading
                ? '...'
                : averageActual !== null
                  ? formatNumber(averageActual)
                  : '—'
            }
            subtitle="Selected day · MW"
            icon={<Zap size={21} />}
            accent="violet"
          />
        </section>

        {metricsError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle size={19} className="mt-0.5 shrink-0" />
            <p>
              Monthly accuracy metrics could not be loaded. The forecast
              chart may still be available.
            </p>
          </div>
        )}

        {/* Main chart */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Generation performance
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Forecast vs Actual
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Compare predicted and measured generation throughout the day.
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <label
                htmlFor="analysis-date"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Analysis date
              </label>

              <input
                id="analysis-date"
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:w-52"
              />
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {loading ? (
              <div className="flex h-80 flex-col items-center justify-center">
                <RefreshCw
                  size={30}
                  className="animate-spin text-emerald-600"
                />
                <p className="mt-4 text-sm font-medium text-slate-600">
                  Loading generation data...
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Connecting to the analytics backend
                </p>
              </div>
            ) : errorMessage ? (
              <div className="flex h-80 flex-col items-center justify-center px-4 text-center">
                <div className="rounded-2xl bg-red-50 p-4 text-red-500">
                  <AlertTriangle size={30} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  Unable to load forecast
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {errorMessage}
                </p>

                <button
                  onClick={() => void fetchData(selectedDate)}
                  className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Try again
                </button>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-80 flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <Wind size={30} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  No generation data available
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  There are no observations available for this date. Select
                  another date within January 2026.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Day-ahead forecast
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Actual generation
                  </div>

                  <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                    <Clock3 size={14} />
                    30-minute intervals
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={360}>
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="startTime"
                      tickFormatter={formatTime}
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      minTickGap={25}
                    />

                    <YAxis
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value: number) =>
                        value.toLocaleString('en-GB')
                      }
                      width={65}
                      label={{
                        value: 'Generation (MW)',
                        angle: -90,
                        position: 'insideLeft',
                        style: {
                          fill: '#64748b',
                          fontSize: 12,
                        },
                      }}
                    />

                    <Tooltip
                      labelFormatter={(label) =>
                        `${selectedDate} · ${formatTime(String(label))}`
                      }
                      formatter={(value, name) => [
                        `${formatNumber(Number(value))} MW`,
                        name === 'forecast'
                          ? 'Day-ahead forecast'
                          : 'Actual generation',
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                        padding: '12px 16px',
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: '16px',
                        fontSize: '12px',
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Day-ahead forecast"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                        strokeWidth: 0,
                      }}
                      connectNulls={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual generation"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                        strokeWidth: 0,
                      }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Valid observations returned
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {chartData.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Average absolute error · selected day
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {chartDifference === null
                        ? '—'
                        : `${formatNumber(chartDifference)} MW`}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Metric interpretation */}
        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={21} />
            </div>

            <h3 className="font-bold text-slate-900">MAE</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Measures the average absolute difference between forecast
              generation and actual generation. Lower values indicate smaller
              average errors.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle size={21} />
            </div>

            <h3 className="font-bold text-slate-900">RMSE</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Penalizes large forecasting errors more heavily, making it useful
              for understanding the impact of substantial deviations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ArrowUpRight size={21} />
            </div>

            <h3 className="font-bold text-slate-900">Forecast Bias</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Under the forecast-minus-actual convention, positive bias
              indicates overforecasting and negative bias indicates
              underforecasting.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-slate-200 py-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            WindMetrics · UK Wind Power Analytics · January 2026
          </p>

          <p>
            {lastUpdated
              ? `Last successful forecast fetch: ${lastUpdated.toLocaleTimeString()}`
              : 'Waiting for forecast data'}
          </p>
        </footer>

        <p className="pb-6 text-center text-xs leading-5 text-slate-400">
          Data may include simulated observations when live data is unavailable.
          Demonstration metrics should not be used as the sole basis for
          real-world electricity trading decisions.
        </p>
      </main>
    </div>
  );
}

const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  accent,
}: KPICardProps) => {
  const accentClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-slate-500">
          {title}
        </p>

        <div
          className={`shrink-0 rounded-xl p-3 ${
            accentClasses[accent] ?? accentClasses.emerald
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>

        <span className="text-sm font-medium text-slate-400">MW</span>
      </div>

      <p className="mt-3 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
};

export default App;
