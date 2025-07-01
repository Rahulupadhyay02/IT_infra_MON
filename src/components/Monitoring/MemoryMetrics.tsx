import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MemoryMetricsProps {
  data: MonitoringData['monitoring']['server-info'][string]['memory']['physical'];
  instanceId: string;
}

const MemoryMetrics: React.FC<MemoryMetricsProps> = ({ data, instanceId }) => {
  const usedPercentage = (data.used / data.total) * 100;
  const buffersPercentage = (data.buffers / data.total) * 100;
  const freePercentage = 100 - usedPercentage - buffersPercentage;

  const memoryData = [
    { name: 'Used', value: usedPercentage },
    { name: 'Buffers', value: buffersPercentage },
    { name: 'Free', value: freePercentage }
  ];

  const COLORS = [
    'url(#memoryUsedGradient)', // Used
    '#60a5fa', // Buffers
    '#e5e7eb'  // Free
  ];

  const formatGigaBytes = (value: number) => {
    if (!value || isNaN(value)) return '0.00 GB';
    const gbValue = value / 100;
    return `${gbValue.toFixed(2)} GB`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 fade-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Memory Usage</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Memory</p>
          <p className="text-2xl font-bold text-blue-600">{formatGigaBytes(data.total)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Used Memory</p>
          <p className="text-2xl font-bold text-blue-600">{formatGigaBytes(data.used)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Buffer Memory</p>
          <p className="text-2xl font-bold text-blue-600">{formatGigaBytes(data.buffers)}</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <radialGradient id="memoryUsedGradient" cx="50%" cy="50%" r="80%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
              </radialGradient>
            </defs>
            <Pie
              data={memoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              isAnimationActive={true}
            >
              {memoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        {memoryData.map((entry, index) => (
          <div key={entry.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ background: COLORS[index] }}
            />
            <span className="text-sm text-gray-600">
              {entry.name}: {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryMetrics; 