import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wind, Activity, AlertTriangle, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

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

function App() {
  const [selectedDate, setSelectedDate] = useState<string>(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [metrics, setMetrics] = useState<AccuracyMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(selectedDate);
    fetchMetrics();
  }, [selectedDate]);

  const fetchData = async (date: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/forecast?target_date=${date}`);
      setChartData(res.data.data_points);
    } catch (error) {
      console.error("Error fetching forecast:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/accuracy?month=2026-01`);
      setMetrics(res.data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Wind className="w-8 h-8 text-blue-600" />
          UK Wind Power Day-Ahead Dashboard
        </h1>
        <p className="text-slate-500 mt-2">Pilot Project: Quantifying Forecast Accuracy for Procurement Decisions</p>
      </header>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPICard title="Monthly MAE" value={`${metrics.mae_mw} MW`} icon={<Activity className="w-6 h-6 text-emerald-500" />} desc="Mean Absolute Error (Jan 2026)" />
          <KPICard title="Monthly RMSE" value={`${metrics.rmse_mw} MW`} icon={<AlertTriangle className="w-6 h-6 text-amber-500" />} desc="Root Mean Square Error" />
          <KPICard title="Forecast Bias" value={`${metrics.bias_mw} MW`} icon={<Wind className="w-6 h-6 text-blue-500" />} desc="Systematic Over/Under estimation" />
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <label className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Select Analysis Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-700">Day-Ahead Forecast vs Actual Generation ({selectedDate})</h2>
        {loading ? (
          <div className="h-96 flex items-center justify-center text-slate-400">Loading data...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="startTime"
                tickFormatter={(tick: string) => new Date(tick).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                stroke="#64748b"
              />
              <YAxis label={{ value: 'Generation (MW)', angle: -90, position: 'insideLeft' }} stroke="#64748b"/>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                labelFormatter={(label) => new Date(label as string).toLocaleString()}
              />
              <Legend />
              <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Day-Ahead Forecast" dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual Generation" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="mt-4 text-sm text-slate-500 text-center">
          *Data sourced from Elexon BMRS (FUELHH & WINDFOR streams). Mocked for Jan 2026 pilot.
        </div>
      </div>
    </div>
  );
}

const KPICard = ({ title, value, icon, desc }: { title: string, value: string, icon: React.ReactNode, desc: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
  </div>
);

export default App;
