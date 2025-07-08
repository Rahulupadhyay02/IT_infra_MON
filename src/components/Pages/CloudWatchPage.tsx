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
  const metricsData = timestamps.map((timestamp, idx) => {
    const serverInfo = data?.monitoring?.['server-info'][timestamp];
    if (!serverInfo) return null;
    // Most recent is 'Now', then -1, -2, ...
    const indexLabel = idx === timestamps.length - 1 ? 'Now' : `-${timestamps.length - 1 - idx}`;
    return {
      indexLabel,
      cpu: serverInfo.cpu.usage.overall,
      memory: (serverInfo.memory.physical.used / serverInfo.memory.physical.total) * 100,
      diskUsage: serverInfo.storage.volumes[0]?.size.percentage || 0,
      networkIn: serverInfo.network.connections.established || 0,
      networkOut: serverInfo.network.connections.timeWait || 0
    };
  }).filter((data): data is NonNullable<typeof data> => data !== null);

  const AI_BAR_COLORS = ['#7F1DFF', '#00E6D8', '#FFB300', '#F43F5E', '#7C3AED', '#0891B2'];
  const AI_GRADIENTS = (
    <defs>
      <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#00E6D8" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#00E6D8" stopOpacity={0.1}/>
      </linearGradient>
      <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#FFB300" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#FFB300" stopOpacity={0.1}/>
      </linearGradient>
    </defs>
  );

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
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                <XAxis dataKey="indexLabel" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #7F1DFF', boxShadow: '0 4px 24px #7F1DFF22' }} labelStyle={{ color: '#7F1DFF' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
                <Bar dataKey="cpu" name="CPU Usage (%)" isAnimationActive={true} label={{ position: 'top', fill: '#7F1DFF', fontWeight: 700, fontSize: 12, formatter: (v: number) => `${v}%` }}>
                  {metricsData.map((entry, index) => (
                    <Cell key={`cell-cpu-${index}`} fill={AI_BAR_COLORS[index % AI_BAR_COLORS.length]} filter="url(#cpuShadow)" />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="cpu" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4, fill: '#F43F5E' }} name="Trend" isAnimationActive={true} />
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
                {AI_GRADIENTS}
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                <XAxis dataKey="indexLabel" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #00E6D8', boxShadow: '0 4px 24px #00E6D822' }} labelStyle={{ color: '#00E6D8' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#00E6D8" 
                  fill="url(#memoryGradient)"
                  strokeWidth={3}
                  name="Memory Usage (%)"
                  dot={{ r: 4, fill: '#00E6D8', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 0 6px #00E6D888)' }}
                  isAnimationActive={true}
                  label={{ position: 'top', fill: '#00E6D8', fontWeight: 700, fontSize: 12, formatter: (v: number) => `${v}%` }}
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
                {AI_GRADIENTS}
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                <XAxis dataKey="indexLabel" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #FFB300', boxShadow: '0 4px 24px #FFB30022' }} labelStyle={{ color: '#FFB300' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
                <Area 
                  type="monotone" 
                  dataKey="diskUsage" 
                  stroke="#FFB300" 
                  fill="url(#diskGradient)"
                  strokeWidth={3}
                  name="Disk Usage (%)"
                  dot={{ r: 4, fill: '#FFB300', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 0 6px #FFB30088)' }}
                  isAnimationActive={true}
                  label={{ position: 'top', fill: '#FFB300', fontWeight: 700, fontSize: 12, formatter: (v: number) => `${v}%` }}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                <XAxis dataKey="indexLabel" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #0891B2', boxShadow: '0 4px 24px #0891B222' }} labelStyle={{ color: '#0891B2' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
                <Bar dataKey="networkIn" name="Connections In" fill="#0891B2" isAnimationActive={true} label={{ position: 'top', fill: '#0891B2', fontWeight: 700, fontSize: 12 }} />
                <Bar dataKey="networkOut" name="Connections Out" fill="#F43F5E" isAnimationActive={true} label={{ position: 'top', fill: '#F43F5E', fontWeight: 700, fontSize: 12 }} />
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
                    {metric.indexLabel}
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