import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MemoryMetricsProps {
  data: MonitoringData['monitoring']['server-info'][string]['memory']['physical'];
  swap: MonitoringData['monitoring']['server-info'][string]['memory']['swap'];
  virtualMemory: MonitoringData['monitoring']['server-info'][string]['memory']['virtualMemory'];
  instanceId: string;
  exportMode?: boolean;
}

const MemoryMetrics: React.FC<MemoryMetricsProps> = ({ data, swap, virtualMemory, instanceId, exportMode = false }) => {
  const usedPercentage = (data.used / data.total) * 100;
  const buffersPercentage = (data.buffers / data.total) * 100;
  const freePercentage = 100 - usedPercentage - buffersPercentage;

  const memoryData = [
    { name: 'Used', value: usedPercentage },
    { name: 'Buffers', value: buffersPercentage },
    { name: 'Free', value: freePercentage }
  ];

  const COLORS = [
    '#7F1DFF', // Used
    '#00E6D8', // Buffers
    '#E0E7FF'  // Free
  ];

  const formatGigaBytes = (value: number) => {
    if (!value || isNaN(value)) return '0.0 MB';
    const gbValue = value < 1024 ? value : (value % 1024); // Convert to GB if value is in MB
    return `${gbValue.toFixed(2)} MB`;
  };

  // Swap memory chart data
  const swapUsedPercent = (swap.used / swap.total) * 100;
  const swapFreePercent = 100 - swapUsedPercent;
  const swapData = [
    { name: 'Used', value: swapUsedPercent },
    { name: 'Free', value: swapFreePercent }
  ];
  const SWAP_COLORS = ['#FFB300', '#E0E7FF'];

  // Virtual memory chart data
  const virtUsedPercent = (virtualMemory.used / virtualMemory.total) * 100;
  const virtFreePercent = 100 - virtUsedPercent;
  const virtData = [
    { name: 'Used', value: virtUsedPercent },
    { name: 'Free', value: virtFreePercent }
  ];
  const VIRT_COLORS = ['#7C3AED', '#E0E7FF'];

  // Add a simple GaugeChart component for swap and virtual memory
  const GaugeChart = ({ value, color, label }: { value: number; color: string; label: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 120 60">
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#E0E7FF" strokeWidth="12" />
      <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="url(#gaugeGradient)" strokeWidth="12" strokeDasharray={`${Math.PI*50*(value/100)},${Math.PI*50*(1-value/100)}`} />
      <text x="60" y="40" textAnchor="middle" fontSize="18" fill={color} fontWeight="bold">{value.toFixed(1)}%</text>
      <text x="60" y="55" textAnchor="middle" fontSize="12" fill="#64748B">{label}</text>
    </svg>
  );

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${exportMode ? '' : 'fade-in'}`}>
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
            <Pie
              data={memoryData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              isAnimationActive={!exportMode}
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            >
              {memoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="#fff" strokeWidth={2} filter="url(#memoryShadow)" />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #7F1DFF', boxShadow: '0 4px 24px #7F1DFF22' }} />
            <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
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
        <div className="h-48 flex items-center justify-center">
          <GaugeChart value={swapUsedPercent} color="#FFB300" label="Swap Used" />
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
        <div className="h-48 flex items-center justify-center">
          <GaugeChart value={virtUsedPercent} color="#7C3AED" label="Virtual Used" />
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
