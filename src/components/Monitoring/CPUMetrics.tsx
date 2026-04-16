import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart } from 'recharts';

interface CPUMetricsProps {
  data: MonitoringData['monitoring']['server-info'][string]['cpu'];
  instanceId: string;
  exportMode?: boolean;
}

const CPUMetrics: React.FC<CPUMetricsProps> = ({ data, instanceId, exportMode = false }) => {
  const cpuData = [
    { name: '1 min', value: data.usage.loadAverages['1min'] },
    { name: '5 min', value: data.usage.loadAverages['5min'] },
    { name: 'Current', value: data.usage.overall }
  ];

  const AI_BAR_COLORS = ['#7F1DFF', '#00E6D8', '#FFB300'];

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${exportMode ? '' : 'fade-in'}`}>
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
          <LineChart data={cpuData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
            <XAxis dataKey="name" stroke="#64748B" />
            <YAxis domain={[0, 100]} stroke="#64748B" />
            <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #7F1DFF', boxShadow: '0 4px 24px #7F1DFF22' }} labelStyle={{ color: '#7F1DFF' }} />
            <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
            <Line type="monotone" dataKey="value" stroke="#7F1DFF" strokeWidth={3} dot={{ r: 6, fill: '#7F1DFF', stroke: '#fff', strokeWidth: 2 }} name="CPU Usage (%)" isAnimationActive={!exportMode} label={{ position: 'top', fill: '#7F1DFF', fontWeight: 700, fontSize: 12, formatter: (v: number) => `${v}%` }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Per-Core Usage Chart */}
      {data.perCore && data.perCore.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-slate-700 mb-2">Per-Core Usage</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.perCore.map(core => ({
                core: `Core ${core.id}`,
                usage: core.usage
              }))}>
                <PolarGrid />
                <PolarAngleAxis dataKey="core" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Usage (%)" dataKey="usage" stroke="#00E6D8" fill="#00E6D8" fillOpacity={0.6} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CPUMetrics; 
