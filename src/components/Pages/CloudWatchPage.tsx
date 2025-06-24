import React from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Clock, Filter } from 'lucide-react';
import PageWrapper from './PageWrapper';

const CloudWatchPage: React.FC = () => {
  const { data, loading, error } = useFirebaseData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading metrics</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  // Get all timestamps and sort them
  const timestamps = Object.keys(data?.monitoring?.['server-info'] || {}).sort();
  
  // Prepare data for charts
  const metricsData = timestamps.map(timestamp => {
    const serverInfo = data?.monitoring?.['server-info'][timestamp];
    if (!serverInfo) return null;
    
    return {
      timestamp: new Date(timestamp.replace(/-/g, ':')).toLocaleTimeString(),
      cpu: serverInfo.cpu.usage.overall,
      memory: (serverInfo.memory.physical.used / serverInfo.memory.physical.total) * 100,
      diskUsage: serverInfo.storage.volumes[0]?.size.percentage || 0,
      networkIn: serverInfo.network.connections.established || 0,
      networkOut: serverInfo.network.connections.timeWait || 0
    };
  }).filter((data): data is NonNullable<typeof data> => data !== null);

  return (
    <PageWrapper title="CloudWatch Metrics">
      <div className="flex justify-end gap-4 mb-6">
        <button className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg text-gray-700 hover:bg-white/95 transition-all shadow-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Time Range
        </button>
        <button className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg text-gray-700 hover:bg-white/95 transition-all shadow-sm flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Usage Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">CPU Utilization</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(203, 213, 225, 0.2)',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Line type="monotone" dataKey="cpu" stroke="#2563eb" strokeWidth={2} dot={false} name="CPU %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Memory Usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(203, 213, 225, 0.2)',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Line type="monotone" dataKey="memory" stroke="#7c3aed" strokeWidth={2} dot={false} name="Memory %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disk Usage Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Disk Usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(203, 213, 225, 0.2)',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Line type="monotone" dataKey="diskUsage" stroke="#059669" strokeWidth={2} dot={false} name="Disk %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Traffic Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Network Traffic</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(203, 213, 225, 0.2)',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="networkIn" stroke="#0891b2" strokeWidth={2} dot={false} name="Connections In" />
                <Line type="monotone" dataKey="networkOut" stroke="#be123c" strokeWidth={2} dot={false} name="Connections Out" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6 mt-6">
        <h2 className="text-lg font-semibold text-black-100 mb-4">Metrics Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/30">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  CPU Usage
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Memory Usage
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Disk Usage
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Network In
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Network Out
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/30">
              {metricsData.map((metric, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white/30' : 'bg-slate-50/30'} hover:bg-slate-50/50 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {metric.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {metric.cpu.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {metric.memory.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {metric.diskUsage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {metric.networkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {metric.networkOut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CloudWatchPage; 