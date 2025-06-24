import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
          <LineChart data={cpuData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CPUMetrics; 