import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MemoryMetricsProps {
  data: MonitoringData['monitoring']['server-info'][string]['memory']['physical'];
  swap: MonitoringData['monitoring']['server-info'][string]['memory']['swap'];
  virtualMemory: MonitoringData['monitoring']['server-info'][string]['memory']['virtualMemory'];
  instanceId: string;
}

const MemoryMetrics: React.FC<MemoryMetricsProps> = ({ data, swap, virtualMemory, instanceId }) => {
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

  // Swap memory chart data
  const swapUsedPercent = (swap.used / swap.total) * 100;
  const swapFreePercent = 100 - swapUsedPercent;
  const swapData = [
    { name: 'Used', value: swapUsedPercent },
    { name: 'Free', value: swapFreePercent }
  ];
  const SWAP_COLORS = ['#f59e42', '#e5e7eb'];

  // Virtual memory chart data
  const virtUsedPercent = (virtualMemory.used / virtualMemory.total) * 100;
  const virtFreePercent = 100 - virtUsedPercent;
  const virtData = [
    { name: 'Used', value: virtUsedPercent },
    { name: 'Free', value: virtFreePercent }
  ];
  const VIRT_COLORS = ['#7c3aed', '#e5e7eb'];

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
      {/* Swap Memory Chart */}
      <div className="mt-10">
        <h4 className="text-md font-semibold text-orange-600 mb-2">Swap Memory Usage</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={swapData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={true}
              >
                {swapData.map((entry, idx) => (
                  <Cell key={`swap-cell-${idx}`} fill={SWAP_COLORS[idx]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex flex-col items-center text-sm text-gray-700">
            <span>Used: {formatGigaBytes(swap.used)}</span>
            <span>Free: {formatGigaBytes(swap.free)}</span>
            <span>Total: {formatGigaBytes(swap.total)}</span>
          </div>
        </div>
      </div>
      {/* Virtual Memory Chart */}
      <div className="mt-10">
        <h4 className="text-md font-semibold text-purple-600 mb-2">Virtual Memory Usage</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={virtData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={true}
              >
                {virtData.map((entry, idx) => (
                  <Cell key={`virt-cell-${idx}`} fill={VIRT_COLORS[idx]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex flex-col items-center text-sm text-gray-700">
            <span>Used: {formatGigaBytes(virtualMemory.used)}</span>
            <span>Free: {formatGigaBytes(virtualMemory.free)}</span>
            <span>Total: {formatGigaBytes(virtualMemory.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryMetrics; 