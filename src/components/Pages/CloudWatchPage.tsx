import React from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
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

  const BAR_COLORS = ['#6366f1', '#14b8a6', '#f59e42', '#f43f5e', '#7c3aed', '#0891b2'];

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
        <div id="cpu-utilization-section" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">CPU Utilization</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: '0.75rem', border: '1px solid #e0e7ff' }} />
                <Legend />
                <Bar dataKey="cpu" name="CPU Usage (%)" isAnimationActive={true}>
                  {metricsData.map((entry, index) => (
                    <Cell key={`cell-cpu-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="cpu" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} name="Trend" isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage Chart */}
        <div id="memory-usage-section" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Memory Usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: '0.75rem', border: '1px solid #e0e7ff' }} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#14b8a6" 
                  fill="url(#memoryGradient)"
                  strokeWidth={3}
                  name="Memory Usage (%)"
                  dot={false}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disk Usage Chart */}
        <div id="disk-usage-section" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Disk Usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e42" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e42" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: '0.75rem', border: '1px solid #e0e7ff' }} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="diskUsage" 
                  stroke="#f59e42" 
                  fill="url(#diskGradient)"
                  strokeWidth={3}
                  name="Disk Usage (%)"
                  dot={false}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Traffic Chart */}
        <div id="network-traffic-section" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Network Traffic</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: '0.75rem', border: '1px solid #e0e7ff' }} />
                <Legend />
                <Bar dataKey="networkIn" name="Connections In" fill="#0891b2" isAnimationActive={true} />
                <Bar dataKey="networkOut" name="Connections Out" fill="#f43f5e" isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div id="metrics-summary-section" className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6 mt-6">
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