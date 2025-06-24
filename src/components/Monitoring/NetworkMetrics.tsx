import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NetworkMetricsProps {
  networkData: MonitoringData['monitoring']['server-info'][string]['network'];
  instanceId: string;
}

const NetworkMetrics: React.FC<NetworkMetricsProps> = ({ networkData, instanceId }) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const connectionData = [
    { name: 'Established', value: networkData.connections.established },
    { name: 'Time Wait', value: networkData.connections.timeWait },
    { name: 'Close Wait', value: networkData.connections.closeWait },
    { name: 'Listening', value: networkData.connections.listening }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
          <BarChart data={connectionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Bar dataKey="value" fill="#2563eb" />
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