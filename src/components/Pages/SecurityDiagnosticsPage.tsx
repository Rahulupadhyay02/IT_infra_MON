import React from 'react';
import PageWrapper from './PageWrapper';
import { useFirebaseData } from '../../hooks/useFirebaseData';

const SecurityDiagnosticsPage = () => {
  const { data, loading, error } = useFirebaseData();

  let serverInfo: any = null;
  if (data && data.monitoring && data.monitoring['server-info']) {
    const timestamps = Object.keys(data.monitoring['server-info']).sort().reverse();
    if (timestamps.length > 0) {
      serverInfo = data.monitoring['server-info'][timestamps[0]];
    }
  }

  if (loading) {
    return (
      <PageWrapper title="Security & Diagnostics Dashboard">
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !serverInfo) {
    return (
      <PageWrapper title="Security & Diagnostics Dashboard">
        <div className="text-red-600 font-semibold text-center py-12">{error ? String(error) : 'No monitoring data available.'}</div>
      </PageWrapper>
    );
  }

  // Extract live data
  const firewall = serverInfo.firewall || {};
  const disks = (serverInfo.smart && serverInfo.smart.disks) || [];
  const backupError = serverInfo.backups?.error || 'No backup error.';
  const mysqlError = serverInfo.mysql?.error || 'No MySQL error.';
  const network = serverInfo.network || {};
  const topProcesses = (serverInfo.processes && serverInfo.processes.topProcesses && serverInfo.processes.topProcesses.cpu) || [];

  return (
    <PageWrapper title="Security & Diagnostics Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Firewall Status */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Firewall Status</h2>
          <ul>
            {Object.entries(firewall).map(([zone, status]) => (
              <li key={zone} className="mb-2">
                <span className="font-medium capitalize">{zone}:</span> <span className={status === 'ON' ? 'text-green-600' : 'text-red-600'}>{status}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Disk SMART Health */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Disk SMART Health</h2>
          <ul>
            {disks.length === 0 && <li className="text-gray-500">No disk data available.</li>}
            {disks.map((disk: any, idx: number) => (
              <li key={idx} className="mb-2">
                <span className="font-medium">{disk.FriendlyName || disk.DeviceId}</span> ({disk.MediaType}, {Math.round((disk.Size || 0) / 1e9)}GB): <span className={disk.HealthStatus === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}>{disk.HealthStatus}</span> <span className={disk.OperationalStatus === 'OK' ? 'text-green-600' : 'text-red-600'}>({disk.OperationalStatus})</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Backup/Service Errors */}
        <div className="bg-white rounded-xl shadow p-6 col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Backup & Service Errors</h2>
          <ul>
            <li className="mb-2 text-red-600">Backup: {backupError}</li>
            <li className="mb-2 text-red-600">MySQL: {mysqlError}</li>
          </ul>
        </div>
        {/* Network Diagnostics */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Network Diagnostics</h2>
          <div className="mb-2">DNS Response Time: <span className={network.dns && network.dns.responseTime < 100 ? 'text-green-600' : 'text-red-600'}>{network.dns ? network.dns.responseTime : 'N/A'} ms</span></div>
          <div className="mb-2">DNS Servers: {network.dns && network.dns.servers ? network.dns.servers.join(', ') : 'N/A'}</div>
          <div>Connections: {network.connections ? Object.entries(network.connections).map(([k, v]) => `${k}: ${v}`).join(', ') : 'N/A'}</div>
        </div>
        {/* Top Processes */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Processes</h2>
          <div className="text-xs text-gray-500 mb-2">CPU usage is per core. 800% = 100% on 8 cores.</div>
          <ul>
            {topProcesses.length === 0 && <li className="text-gray-500">No process data available.</li>}
            {topProcesses.map((proc: any, idx: number) => (
              <li key={idx} className="mb-2">
                <span className="font-medium">{proc.name}</span>: CPU <span className="text-blue-600">{proc.cpu_percent?.toFixed(2)}%</span>, MEM <span className="text-purple-600">{proc.memory_percent?.toFixed(2)}%</span> <span className="text-gray-500">({proc.status})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SecurityDiagnosticsPage; 