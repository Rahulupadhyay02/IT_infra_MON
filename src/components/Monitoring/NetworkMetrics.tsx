import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface NetworkMetricsProps {
  networkData: MonitoringData['monitoring']['server-info'][string]['network'];
  instanceId: string;
}

const NetworkMetrics: React.FC<NetworkMetricsProps> = ({ networkData, instanceId }) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const connectionData = [
    {
      name: 'Connections',
      Established: networkData.connections.established,
      'Time Wait': networkData.connections.timeWait,
      'Close Wait': networkData.connections.closeWait,
      Listening: networkData.connections.listening,
    },
  ];

  const COLORS = [
    '#6366f1', // Established
    '#f59e42', // Time Wait
    '#14b8a6', // Close Wait
    '#60a5fa', // Listening
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 fade-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Network Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Connections</p>
          <p className="text-2xl font-bold text-blue-600">{networkData.connections.total}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">DNS Response Time</p>
          <p className="text-2xl font-bold text-blue-600">{networkData.dns.responseTime}ms</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">DNS Servers</p>
          <p className="text-2xl font-bold text-blue-600">{networkData.dns.servers.length}</p>
        </div>
      </div>
      <div className="h-64">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">Connection States</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={connectionData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
            <Bar dataKey="Established" stackId="a" fill={COLORS[0]} isAnimationActive={true} />
            <Bar dataKey="Time Wait" stackId="a" fill={COLORS[1]} isAnimationActive={true} />
            <Bar dataKey="Close Wait" stackId="a" fill={COLORS[2]} isAnimationActive={true} />
            <Bar dataKey="Listening" stackId="a" fill={COLORS[3]} isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {networkData.dns.servers.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">DNS Servers</h4>
          <div className="flex flex-wrap gap-2">
            {networkData.dns.servers.map((server, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                {server}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkMetrics; 