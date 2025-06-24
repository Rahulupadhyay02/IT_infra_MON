import React from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { Server, Power, HardDrive, Cpu, CircuitBoard, Network, Clock, Shield } from 'lucide-react';
import PageWrapper from './PageWrapper';

const EC2InstancesPage = () => {
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading instances</h3>
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
        <Server className="mx-auto h-12 w-12 text-gray-800" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No instances found</h3>
        <p className="mt-1 text-sm text-gray-500">No server information is currently available.</p>
      </div>
    );
  }

  const { systemInfo, cpu, memory, storage } = serverInfo;

  return (
    <PageWrapper title="EC2 Instance Details">
      <div className="flex justify-end gap-4 mb-6">
        <button className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg text-gray-700 hover:bg-white/95 transition-all shadow-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          View History
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Security Groups
        </button>
      </div>

      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20">
        <div className="px-6 py-4 border-b border-gray-200/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Server className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-semibold text-slate-1000">{systemInfo.basics.hostname}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/80 text-green-800 backdrop-blur-sm">
                Running
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Information */}
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">System Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">OS</span>
                  <span className="text-sm font-medium text-slate-800">{systemInfo.basics.os.name} {systemInfo.basics.os.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Architecture</span>
                  <span className="text-sm font-medium text-slate-800">{systemInfo.basics.os.architecture}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Kernel</span>
                  <span className="text-sm font-medium text-slate-800">{systemInfo.basics.os.kernel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Uptime</span>
                  <span className="text-sm font-medium text-slate-800">{systemInfo.basics.os.uptime}</span>
                </div>
              </div>
            </div>

            {/* Hardware Information */}
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Hardware Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Model</span>
                  <span className="text-sm font-medium text-slate-800">{systemInfo.basics.hardware.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Manufacturer</span>
                  <span className="text-sm font-medium text-slate-800">{systemInfo.basics.hardware.manufacturer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">BIOS Version</span>
                  <span className="text-sm font-medium text-slate-800">{systemInfo.basics.hardware.biosVersion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Serial Number</span>
                  <span className="text-sm font-medium text-slate-800">{systemInfo.basics.hardware.serialNumber}</span>
                </div>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Resource Usage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">CPU Usage</span>
                    <span className="text-sm font-medium text-slate-800">{cpu.usage.overall.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${cpu.usage.overall}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Memory Usage</span>
                    <span className="text-sm font-medium text-slate-800">
                      {((memory.physical.used / memory.physical.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <div 
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(memory.physical.used / memory.physical.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Storage Usage</span>
                    <span className="text-sm font-medium text-slate-800">
                      {storage.volumes[0]?.size.percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${storage.volumes[0]?.size.percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CPU Details */}
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">CPU Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Model</span>
                  <span className="text-sm font-medium text-slate-800">{cpu.hardware.modelName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Cores/Threads</span>
                  <span className="text-sm font-medium text-slate-800">{cpu.hardware.cores}/{cpu.hardware.threads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Base/Max Speed</span>
                  <span className="text-sm font-medium text-slate-800">{cpu.hardware.baseSpeed}/{cpu.hardware.maxSpeed} MHz</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Load Average</span>
                  <span className="text-sm font-medium text-slate-800">
                    {cpu.usage.loadAverages['1min'].toFixed(2)}, {cpu.usage.loadAverages['5min'].toFixed(2)}, {cpu.usage.loadAverages['15min'].toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Storage Details */}
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Storage Details</h3>
              <div className="space-y-4">
                {storage.volumes.map((volume, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">{volume.mountPoint}</span>
                      <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                        volume.smart.status === 'OK' ? 'bg-green-100/80 text-green-800' : 'bg-red-100/80 text-red-800'
                      }`}>
                        {volume.smart.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {(volume.size.used / 1024).toFixed(2)} GB used of {(volume.size.total / 1024).toFixed(2)} GB
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          volume.size.percentage > 90 ? 'bg-red-500' :
                          volume.size.percentage > 70 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${volume.size.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EC2InstancesPage; 