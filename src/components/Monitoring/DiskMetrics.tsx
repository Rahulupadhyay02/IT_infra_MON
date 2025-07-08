import React from 'react';
import { MonitoringData } from '../../types/monitoring';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DiskMetricsProps {
  data: MonitoringData['monitoring']['server-info'][string]['storage'];
  smartDisks: MonitoringData['monitoring']['server-info'][string]['smart']['disks'];
}

const DiskMetrics: React.FC<DiskMetricsProps> = ({ data, smartDisks }) => {
  const formatGigaBytes = (value: number) => {
    if (!value || isNaN(value)) return '0.00 GB';
    
    // Convert the raw value to GB (value is in thousandths of GB)
    const gbValue = value / 1000;
    return `${gbValue.toFixed(2)} GB`;
  };

  // Aggregate data from all volumes
  const aggregatedData = data.volumes.reduce((acc, volume) => ({
    total: acc.total + volume.size.total,
    used: acc.used + volume.size.used,
    free: acc.free + volume.size.free
  }), { total: 0, used: 0, free: 0 });

  const percentage = Math.round((aggregatedData.used / aggregatedData.total) * 100) || 0;

  const diskPieData = [
    { name: 'Used', value: aggregatedData.used },
    { name: 'Free', value: aggregatedData.free }
  ];
  const PIE_COLORS = [
    '#FFB300',
    '#E0E7FF'
  ];

  // Add a simple GaugeChart for total disk usage
  const GaugeChart = ({ value, color, label }: { value: number; color: string; label: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 120 60">
      <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#E0E7FF" strokeWidth="12" />
      <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke={color} strokeWidth="12" strokeDasharray={`${Math.PI*50*(value/100)},${Math.PI*50*(1-value/100)}`} />
      <text x="60" y="40" textAnchor="middle" fontSize="18" fill={color} fontWeight="bold">{value.toFixed(1)}%</text>
      <text x="60" y="55" textAnchor="middle" fontSize="12" fill="#64748B">{label}</text>
    </svg>
  );

  // Add a simple Treemap for per-volume usage
  const Treemap = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
    // Simple horizontal treemap layout
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let x = 0;
    return (
      <svg width="100%" height="60">
        {data.map((d, i) => {
          const width = total ? (d.value / total) * 400 : 0;
          const rect = <rect key={d.name} x={x} y={10} width={width} height={40} fill={d.color} rx={6} />;
          const label = <text key={d.name + '-label'} x={x + width / 2} y={35} textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="14">{d.name}</text>;
          x += width;
          return [rect, label];
        })}
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 fade-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Storage Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <div className="w-full mb-2">
              <Treemap data={data.volumes.map((volume, idx) => ({
                name: volume.mountPoint,
                value: volume.size.used,
                color: idx % 2 === 0 ? '#FFB300' : '#7F1DFF'
              }))} />
            </div>
            <div className="w-2/3 h-20 flex items-center justify-center">
              <GaugeChart value={percentage} color="#FFB300" label="Total Used" />
            </div>
          </div>
        </div>
        <div>
          {data.volumes.map((volume, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-600">
                  {volume.mountPoint} ({volume.fileSystem})
                </p>
                <span className={`px-2 py-1 text-xs rounded ${
                  volume.smart.status === 'OK' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {volume.smart.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-bold text-blue-600">{formatGigaBytes(volume.size.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Used</p>
                  <p className="text-lg font-bold text-blue-600">{formatGigaBytes(volume.size.used)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Free</p>
                  <p className="text-lg font-bold text-blue-600">{formatGigaBytes(volume.size.free)}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r from-orange-400 via-yellow-400 to-blue-400 transition-all duration-300`}
                    style={{ width: `${volume.size.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{volume.size.percentage}% used</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-600 mb-4">Total Storage Usage</h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Storage</p>
            <p className="text-xl font-bold text-blue-600">{formatGigaBytes(aggregatedData.total)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Used Space</p>
            <p className="text-xl font-bold text-blue-600">{formatGigaBytes(aggregatedData.used)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Free Space</p>
            <p className="text-xl font-bold text-blue-600">{formatGigaBytes(aggregatedData.free)}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full bg-gradient-to-r from-orange-400 via-yellow-400 to-blue-400 transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">0%</span>
          <span className="text-sm text-gray-600">50%</span>
          <span className="text-sm text-gray-600">100%</span>
        </div>
      </div>
      {/* SMART Disk Health Table */}
      {smartDisks && smartDisks.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-slate-700 mb-4">SMART Disk Health</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Device ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Health</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Size</th>
                </tr>
              </thead>
              <tbody>
                {smartDisks.map((disk, idx) => (
                  <tr key={disk.DeviceId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-2 text-sm text-slate-800">{disk.DeviceId}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{disk.FriendlyName}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        disk.HealthStatus === 'Healthy' ? 'bg-green-100 text-green-800' :
                        disk.HealthStatus === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {disk.HealthStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{disk.MediaType}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{disk.OperationalStatus}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{formatGigaBytes(disk.Size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiskMetrics; 