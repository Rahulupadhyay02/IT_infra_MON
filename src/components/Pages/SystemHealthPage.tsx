import React from 'react';
import { PenTool as Tool, RefreshCw } from 'lucide-react';
import StatusIndicator from '../Dashboard/StatusIndicator';
import CPUMetrics from '../Monitoring/CPUMetrics';
import MemoryMetrics from '../Monitoring/MemoryMetrics';
import NetworkMetrics from '../Monitoring/NetworkMetrics';
import DiskMetrics from '../Monitoring/DiskMetrics';
import ServicesMetrics from '../Monitoring/ServicesMetrics';
import PageWrapper from './PageWrapper';
import { useFirebaseData } from '../../hooks/useFirebaseData';

const SystemHealthPage: React.FC = () => {
  const { data, loading, error, lastUpdate } = useFirebaseData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data?.monitoring?.['server-info']) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">{error || 'No monitoring data available'}</p>
      </div>
    );
  }

  // Get the latest timestamp
  const timestamps = Object.keys(data.monitoring['server-info']).sort().reverse();
  const latestTimestamp = timestamps[0];
  const latestData = data.monitoring['server-info'][latestTimestamp];

  const getHealthData = () => {
    const components = [
      {
        name: '🌐 Web Servers (3)',
        status: 'healthy' as const,
        lastCheck: '2 min ago',
        responseTime: '45ms',
      },
      {
        name: '🗄️ Database Cluster',
        status: latestData.mysql?.error ? 'critical' as const : 'healthy' as const,
        lastCheck: '1 min ago',
        responseTime: latestData.mysql?.error ? 'Error' : '120ms',
      },
      {
        name: '⚖️ Load Balancer',
        status: latestData.network.connections.established > 0 ? 'healthy' as const : 'critical' as const,
        lastCheck: '30 sec ago',
        responseTime: `${latestData.network.dns.responseTime}ms`,
      },
      {
        name: '💾 Storage Systems',
        status: latestData.storage.volumes.every(v => v.smart.status === 'OK') ? 'healthy' as const : 'warning' as const,
        lastCheck: '1 min ago',
        responseTime: '15ms',
      },
    ];

    return components;
  };

  const healthData = getHealthData();
  const formattedLastUpdate = lastUpdate ? new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(lastUpdate) : 'N/A';

  return (
    <PageWrapper title="System Health Monitoring">
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 text-sm text-white/80 bg-slate-800 px-3 py-2 rounded-lg backdrop-blur-sm">
          <RefreshCw className="w-4 h-4" />
          <span>Last updated: {formattedLastUpdate}</span>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white/30 backdrop-blur-sm border border-gray-200/20 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200/30">
          <h3 className="text-lg font-semibold text-black-600">Component Status</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
            <Tool className="w-4 h-4" />
            Run Health Check
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Component</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Check</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Response Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/30">
              {healthData.map((component, index) => (
                <tr key={component.name} className={index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/50'}>
                  <td className="px-4 py-3 text-sm text-slate-800 font-medium">{component.name}</td>
                  <td className="px-4 py-3">
                    <StatusIndicator status={component.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{component.lastCheck}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{component.responseTime}</td>
                  <td className="px-4 py-3 text-sm">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg shadow-lg overflow-hidden">
          <CPUMetrics data={latestData.cpu} instanceId={latestTimestamp} />
        </div>
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg shadow-lg overflow-hidden">
          <MemoryMetrics data={latestData.memory.physical} instanceId={latestTimestamp} />
        </div>
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg shadow-lg overflow-hidden">
          <NetworkMetrics networkData={latestData.network} instanceId={latestTimestamp} />
        </div>
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg shadow-lg overflow-hidden">
          <DiskMetrics data={latestData.storage} />
        </div>
      </div>

      {/* Services */}
      <div className="mt-6 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg shadow-lg overflow-hidden">
        <ServicesMetrics data={latestData.processes.topProcesses.cpu} instanceId={latestTimestamp} />
      </div>
    </PageWrapper>
  );
};

export default SystemHealthPage;