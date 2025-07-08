import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

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
    '#7F1DFF', // Established
    '#FFB300', // Time Wait
    '#00E6D8', // Close Wait
    '#7C3AED', // Listening
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
          <AreaChart data={connectionData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
            <XAxis dataKey="name" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip formatter={(value: number) => formatNumber(value)} contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #7F1DFF', boxShadow: '0 4px 24px #7F1DFF22' }} labelStyle={{ color: '#7F1DFF' }} />
            <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
            <Area type="monotone" dataKey="Established" stackId="a" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.7} />
            <Area type="monotone" dataKey="Time Wait" stackId="a" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.7} />
            <Area type="monotone" dataKey="Close Wait" stackId="a" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.7} />
            <Area type="monotone" dataKey="Listening" stackId="a" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.7} />
          </AreaChart>
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