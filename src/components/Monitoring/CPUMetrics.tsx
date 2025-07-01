import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, Line } from 'recharts';

interface CPUMetricsProps {
  data: MonitoringData['monitoring']['server-info'][string]['cpu'];
  instanceId: string;
}

const CPUMetrics: React.FC<CPUMetricsProps> = ({ data, instanceId }) => {
  const cpuData = [
    { name: '1 min', value: data.usage.loadAverages['1min'] },
    { name: '5 min', value: data.usage.loadAverages['5min'] },
    { name: 'Current', value: data.usage.overall }
  ];

  const BAR_COLORS = ['#6366f1', '#14b8a6', '#f59e42'];

  return (
    <div className="bg-white rounded-lg shadow p-6 fade-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">CPU Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Current Usage</p>
          <p className="text-2xl font-bold text-blue-600">{data.usage.overall}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">CPU Cores</p>
          <p className="text-2xl font-bold text-blue-600">{data.hardware.cores}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">5min Average</p>
          <p className="text-2xl font-bold text-blue-600">{data.usage.loadAverages['5min']}%</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cpuData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis domain={[0, 100]} stroke="#64748b" />
            <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: '0.75rem', border: '1px solid #e0e7ff' }} />
            <Legend />
            <Bar dataKey="value" name="CPU Usage (%)" isAnimationActive={true}>
              {cpuData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: '#f43f5e' }} name="Trend" isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Per-Core Usage Chart */}
      {data.perCore && data.perCore.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-slate-700 mb-2">Per-Core Usage</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.perCore.map(core => ({
                id: `Core ${core.id}`,
                usage: core.usage,
                frequency: core.frequency
              }))} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="id" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip formatter={(value, name, props) => [`${value}% @ ${props.payload.frequency} MHz`, 'Usage']} />
                <Bar dataKey="usage" name="Usage (%)" isAnimationActive={true}>
                  {data.perCore.map((core, idx) => (
                    <Cell key={`core-bar-${idx}`} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CPUMetrics; 