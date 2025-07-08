import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { MonitoringData } from '../../types/monitoring';

interface ProcessesMetricsProps {
  summary: MonitoringData['monitoring']['server-info'][string]['processes']['summary'];
  topCPU: MonitoringData['monitoring']['server-info'][string]['processes']['topProcesses']['cpu'];
  topMemory: MonitoringData['monitoring']['server-info'][string]['processes']['topProcesses']['memory'];
  instanceId: string;
}

const COLORS = ['#7F1DFF', '#FFB300', '#00E6D8', '#F43F5E'];

const ProcessesMetrics: React.FC<ProcessesMetricsProps> = ({ summary, topCPU, topMemory, instanceId }) => {
  const [sortBy, setSortBy] = useState<'cpu_percent' | 'memory_percent'>('cpu_percent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tableType, setTableType] = useState<'cpu' | 'memory'>('cpu');

  const summaryData = [
    { name: 'Running', value: summary.running },
    { name: 'Sleeping', value: summary.sleeping },
    { name: 'Zombie', value: summary.zombie },
    { name: 'Stopped', value: summary.stopped },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      case 'sleeping':
        return 'bg-yellow-100 text-yellow-800';
      case 'zombie':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedCPU = [...topCPU].sort((a, b) => {
    const comparison = b.cpu_percent - a.cpu_percent;
    return sortOrder === 'asc' ? -comparison : comparison;
  });
  const sortedMemory = [...topMemory].sort((a, b) => {
    const comparison = b.memory_percent - a.memory_percent;
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 fade-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Processes Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1 flex flex-col items-center justify-center">
          <h4 className="text-md font-semibold text-slate-700 mb-2">Process States</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={summaryData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, Math.max(...summaryData.map(d => d.value), 1)]} />
                <Radar name="Processes" dataKey="value" stroke="#7F1DFF" fill="#7F1DFF" fillOpacity={0.6} />
                <Tooltip formatter={(value) => `${value}`} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1 mt-2 text-sm text-gray-700">
            <div className="flex flex-wrap gap-3 justify-center">
              {summaryData.map((entry, idx) => (
                <span key={entry.name} className="flex items-center px-3 py-1 rounded-full border border-gray-200 bg-gray-50 shadow-sm gap-2">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium">{entry.name}:</span> {entry.value}
                </span>
              ))}
            </div>
            <span className="mt-4 font-semibold block text-center">Total: {summary.total}</span>
          </div>
        </div>
        <div className="col-span-2">
          <div className="flex gap-4 mb-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tableType === 'cpu' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTableType('cpu')}
            >
              Top CPU
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tableType === 'memory' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTableType('memory')}
            >
              Top Memory
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setSortBy('cpu_percent')}>
                    CPU Usage {tableType === 'cpu' && (sortBy === 'cpu_percent' ? (sortOrder === 'asc' ? '↑' : '↓') : '')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setSortBy('memory_percent')}>
                    Memory Usage {tableType === 'memory' && (sortBy === 'memory_percent' ? (sortOrder === 'asc' ? '↑' : '↓') : '')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {(tableType === 'cpu' ? sortedCPU : sortedMemory).map((proc) => (
                  <tr key={`${proc.name}-${proc.pid}`} className="bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.pid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.num_threads}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.cpu_percent.toFixed(1)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.memory_percent.toFixed(1)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(proc.status)}`}>{proc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessesMetrics; 