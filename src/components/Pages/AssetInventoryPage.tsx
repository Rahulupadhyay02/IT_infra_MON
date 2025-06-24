import React from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { Server, HardDrive, Cpu, Network, Shield, CircuitBoard } from 'lucide-react';
import PageWrapper from './PageWrapper';

const AssetInventoryPage: React.FC = () => {
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
        <Server className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading asset inventory</h3>
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
        <Server className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No asset data</h3>
        <p className="mt-1 text-sm text-gray-500">No server information is currently available.</p>
      </div>
    );
  }

  const { systemInfo, cpu, memory, storage, network } = serverInfo;

  return (
    <PageWrapper title="Asset Inventory">
      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20">
        <div className="px-6 py-4 border-b border-gray-200/30">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-black-400">Primary Server</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/80 text-green-800 backdrop-blur-sm">
              Active
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                System Information
              </h3>
              <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-sm">
                <div>
                  <p className="text-sm text-slate-600">Operating System</p>
                  <p className="text-sm font-medium text-slate-800">{systemInfo.basics.os.name} {systemInfo.basics.os.version}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Hostname</p>
                  <p className="text-sm font-medium text-slate-800">{systemInfo.basics.hostname}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Architecture</p>
                  <p className="text-sm font-medium text-slate-800">{systemInfo.basics.os.architecture}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Uptime</p>
                  <p className="text-sm font-medium text-slate-800">{systemInfo.basics.os.uptime}</p>
                </div>
              </div>
            </div>

            {/* CPU Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                CPU Information
              </h3>
              <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-sm">
                <div>
                  <p className="text-sm text-slate-600">Model</p>
                  <p className="text-sm font-medium text-slate-800">{cpu.hardware.modelName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Cores / Threads</p>
                  <p className="text-sm font-medium text-slate-800">{cpu.hardware.cores} cores / {cpu.hardware.threads} threads</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Current Usage</p>
                  <p className="text-sm font-medium text-slate-800">{cpu.usage.overall.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Base / Max Speed</p>
                  <p className="text-sm font-medium text-slate-800">{cpu.hardware.baseSpeed} / {cpu.hardware.maxSpeed} MHz</p>
                </div>
              </div>
            </div>

            {/* Memory Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                <CircuitBoard className="w-4 h-4 text-blue-500" />
                Memory Information
              </h3>
              <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-sm">
                <div>
                  <p className="text-sm text-slate-600">Total Memory</p>
                  <p className="text-sm font-medium text-slate-800">
                    {(memory.physical.total / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Used Memory</p>
                  <p className="text-sm font-medium text-slate-800">
                    {(memory.physical.used / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Free Memory</p>
                  <p className="text-sm font-medium text-slate-800">
                    {(memory.physical.free / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Usage</p>
                  <p className="text-sm font-medium text-slate-800">
                    {((memory.physical.used / memory.physical.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Storage Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-500" />
                Storage Information
              </h3>
              <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-sm">
                {Object.entries(storage).map(([device, info]: [string, any]) => (
                  <div key={device}>
                    <p className="text-sm text-slate-600">{device}</p>
                    <p className="text-sm font-medium text-slate-800">
                      {((info.used / info.total) * 100).toFixed(1)}% used
                      ({(info.free / (1024 * 1024 * 1024)).toFixed(2)} GB free)
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Network Information */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-500" />
                Network Information
              </h3>
              <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Active Connections</p>
                    <p className="text-sm font-medium text-slate-800">{network.connections.established}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Connections</p>
                    <p className="text-sm font-medium text-slate-800">{network.connections.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">DNS Response Time</p>
                    <p className="text-sm font-medium text-slate-800">{network.dns.responseTime} ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AssetInventoryPage; 