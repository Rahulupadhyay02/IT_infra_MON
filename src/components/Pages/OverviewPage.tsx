import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import MetricCard from '../Dashboard/MetricCard';
import StatusIndicator from '../Dashboard/StatusIndicator';
import SystemChart from '../Charts/SystemChart';
import PageWrapper from './PageWrapper';
import { useFirebaseData } from '../../hooks/useFirebaseData';

interface HistoricalDataPoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

const OverviewPage: React.FC = () => {
  const { data, loading, error, lastUpdate } = useFirebaseData();
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);

  // Update historical data whenever new data comes in
  useEffect(() => {
    if (!data) return;

    const timestamps = Object.keys(data.monitoring['server-info']).sort().reverse();
    const latestData = data.monitoring['server-info'][timestamps[0]];

    const newDataPoint = {
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      cpu: latestData.cpu.usage.overall,
      memory: (latestData.memory.physical.used / latestData.memory.physical.total) * 100,
      disk: latestData.storage.volumes[0]?.size.percentage || 0
    };

    setHistoricalData(prevData => {
      // Keep only the last 5 points and add the new one
      const updatedData = [...prevData.slice(-5), newDataPoint];
      // If we have less than 6 points, pad with the current values
      while (updatedData.length < 6) {
        const time = new Date(Date.now() - updatedData.length * 15 * 60 * 1000);
        updatedData.unshift({
          ...newDataPoint,
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
        });
      }
      return updatedData;
    });
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading data: {error || 'No data available'}</div>
      </div>
    );
  }

  // Get the latest server info
  const timestamps = Object.keys(data.monitoring['server-info']).sort().reverse();
  const latestData = data.monitoring['server-info'][timestamps[0]];

  // Calculate real metrics
  const metrics = {
    cpu: latestData.cpu.usage.overall,
    memory: (latestData.memory.physical.used / latestData.memory.physical.total) * 100,
    disk: latestData.storage.volumes[0]?.size.percentage || 0,
    uptime: latestData.systemInfo.basics.os.uptime,
    processes: latestData.processes.summary.total
  };

  // Calculate system health
  const getSystemHealth = () => {
    return {
      webServer: latestData.processes.topProcesses.cpu.some(p => p.name.includes('nginx') || p.name.includes('apache')) ? 'healthy' as const : 'warning' as const,
      database: latestData.mysql?.error ? 'critical' as const : 'healthy' as const,
      storage: latestData.storage.volumes.every(v => v.smart.status === 'OK') ? 'healthy' as const : 'warning' as const,
      network: latestData.network.connections.established > 0 ? 'healthy' as const : 'critical' as const
    } as const;
  };

  const systemHealth = getSystemHealth();

  return (
    <PageWrapper title="Infrastructure Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <MetricCard 
          value={metrics.processes} 
          label="Active Processes" 
          trend={{ direction: 'up', value: `${latestData.processes.summary.running} running` }}
        />
        <MetricCard 
          value={latestData.network.connections.established} 
          label="Active Connections" 
          trend={{ direction: 'up', value: `${latestData.network.connections.total} total` }}
        />
        <MetricCard 
          value={metrics.uptime} 
          label="System Uptime" 
          trend={{ direction: 'up', value: latestData.systemInfo.basics.os.lastBoot }}
        />
        <MetricCard 
          value={`${latestData.storage.volumes.length}`} 
          label="Storage Volumes" 
          trend={{ direction: 'up', value: `${latestData.storage.volumes.filter(v => v.smart.status === 'OK').length} healthy` }}
        />
      </div>

      <div className="bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200/80">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">System Performance Overview</h3>
            <p className="text-sm text-gray-600 mt-1">Historical performance metrics over the last 90 minutes</p>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <div className="text-sm text-gray-700">
              Last updated: {lastUpdate?.toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="bg-gray-50/50 backdrop-blur-sm rounded-lg p-4">
          <SystemChart data={historicalData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/30 backdrop-blur-sm border border-gray-200/20 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-black-600 mb-4">Current System Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center  bg-gray-100/50 backdrop-blur-sm rounded-lg p-4">
              <span className="text-gray-700">CPU Usage</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200/50 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(metrics.cpu, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-800 w-12">{metrics.cpu.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center  bg-gray-100/50 backdrop-blur-sm rounded-lg p-4">
              <span className="text-gray-700">Memory Usage</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200/50 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(metrics.memory, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-800 w-12">{metrics.memory.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center  bg-gray-100/50 backdrop-blur-sm rounded-lg p-4">
              <span className="text-gray-700">Disk Usage</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200/50 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(metrics.disk, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-800 w-12">{metrics.disk.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-sm border border-gray-200/20 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-black-800 mb-4">Active Services</h3>
          <div className="space-y-3">
            {latestData.processes.topProcesses.cpu.slice(0, 3).map((process, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-100/50 backdrop-blur-sm rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-slate-800">{process.name}</span>
                </div>
                <div className="text-sm text-gray-700">
                  CPU: {process.cpu_percent.toFixed(1)}% | MEM: {process.memory_percent.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-sm border border-gray-200/20 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200/30">
          <h3 className="text-lg font-semibold text-black-600">System Status</h3>
          <div className="text-sm text-gray-700">
            OS: {latestData.systemInfo.basics.os.name} {latestData.systemInfo.basics.os.version}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100/50 backdrop-blur-sm rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Web Server</span>
              <StatusIndicator status={systemHealth.webServer} />
            </div>
          </div>
          <div className="p-4 bg-gray-100/50 backdrop-blur-sm rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Database</span>
              <StatusIndicator status={systemHealth.database} />
            </div>
          </div>
          <div className="p-4 bg-gray-100/50 backdrop-blur-sm rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Storage</span>
              <StatusIndicator status={systemHealth.storage} />
            </div>
          </div>
          <div className="p-4 bg-gray-100/50 backdrop-blur-sm rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Network</span>
              <StatusIndicator status={systemHealth.network} />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default OverviewPage;