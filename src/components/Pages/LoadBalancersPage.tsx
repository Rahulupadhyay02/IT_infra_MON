import React from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { Scale, Server, Activity, RefreshCw, Settings } from 'lucide-react';
import PageWrapper from './PageWrapper';

const LoadBalancersPage: React.FC = () => {
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
        <Scale className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading load balancers</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  // Get the latest timestamp's data
  const timestamps = Object.keys(data?.monitoring?.['server-info'] || {}).sort().reverse();
  const latestTimestamp = timestamps[0];
  const serverInfo = latestTimestamp ? data?.monitoring?.['server-info'][latestTimestamp] : null;

  if (!serverInfo) {
    return (
      <div className="text-center py-12">
        <Scale className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No load balancer data</h3>
        <p className="mt-1 text-sm text-gray-500">No server information is currently available.</p>
      </div>
    );
  }

  const { network } = serverInfo;

  // Single load balancer data for the server
  const loadBalancer = {
    id: 'lb-1',
    name: 'Primary Server Load Balancer',
    type: 'Application',
    status: 'active',
    scheme: 'internet-facing',
    connections: {
      active: network.connections.established,
      pending: network.connections.listening,
      failed: network.connections.closeWait
    },
    healthCheck: {
      healthy: 1,
      unhealthy: 0,
      interval: '30 seconds',
      timeout: '5 seconds',
      threshold: '3'
    },
    targets: [
      { id: 'i-001', status: 'healthy', address: network.dns.servers[0] || '127.0.0.1' }
    ]
  };

  return (
    <PageWrapper title="Load Balancer">
      <div className="flex justify-end gap-4 mb-6">
        <button className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg text-gray-700 hover:bg-white/95 transition-all shadow-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20">
        <div className="px-6 py-4 border-b border-gray-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-black-600">{loadBalancer.name}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                loadBalancer.status === 'active' ? 'bg-green-100/80 text-green-800' : 'bg-red-100/80 text-red-800'
              }`}>
                {loadBalancer.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-slate-500 hover:text-slate-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-800 mb-2">Active Connections</h3>
              <div className="flex items-center justify-between">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-semibold text-slate-800">{loadBalancer.connections.active}</span>
              </div>
            </div>
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-800 mb-2">Healthy Targets</h3>
              <div className="flex items-center justify-between">
                <Server className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-semibold text-slate-800">{loadBalancer.healthCheck.healthy}/{loadBalancer.targets.length}</span>
              </div>
            </div>
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-800 mb-2">Type</h3>
              <div className="flex items-center justify-between">
                <Scale className="w-5 h-5 text-purple-500" />
                <span className="text-lg font-semibold text-slate-800">{loadBalancer.type}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200/30 pt-4">
            <h3 className="text-sm font-semibold text-black-600 mb-4">Target Instance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/30">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-800 uppercase tracking-wider">
                      Instance ID
                    </th>
                    <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-800 uppercase tracking-wider">
                      Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/30">
                  {loadBalancer.targets.map((target) => (
                    <tr key={target.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {target.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                          target.status === 'healthy' ? 'bg-green-100/80 text-green-800' : 'bg-red-100/80 text-red-800'
                        }`}>
                          {target.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                        {target.address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-200/30 mt-4 pt-4">
            <h3 className="text-sm font-semibold text-black-600 mb-4">Health Check Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-800">Interval</p>
                <p className="text-sm font-medium text-slate-800">{loadBalancer.healthCheck.interval}</p>
              </div>
              <div className="bg-slate-50/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-800">Timeout</p>
                <p className="text-sm font-medium text-slate-800">{loadBalancer.healthCheck.timeout}</p>
              </div>
              <div className="bg-slate-50/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-800">Threshold</p>
                <p className="text-sm font-medium text-slate-800">{loadBalancer.healthCheck.threshold}</p>
              </div>
              <div className="bg-slate-50/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-800">Scheme</p>
                <p className="text-sm font-medium text-slate-800">{loadBalancer.scheme}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default LoadBalancersPage; 