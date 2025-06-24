import React from 'react';
import { MonitoringData } from '../../types/monitoring';

interface DiskMetricsProps {
  data: MonitoringData['monitoring']['server-info'][string]['storage'];
}

const DiskMetrics: React.FC<DiskMetricsProps> = ({ data }) => {
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

  const diskData = [
    { name: 'Used', value: aggregatedData.used },
    { name: 'Free', value: aggregatedData.free }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Storage Metrics</h3>
      
      <div className="grid grid-cols-1 gap-4 mb-6">
        {data.volumes.map((volume, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
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
                  className={`h-2 rounded-full ${
                    volume.size.percentage > 90 ? 'bg-red-600' :
                    volume.size.percentage > 70 ? 'bg-yellow-500' :
                    'bg-blue-600'
                  }`}
                  style={{ width: `${volume.size.percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{volume.size.percentage}% used</p>
            </div>
          </div>
        ))}
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
            className={`h-2.5 rounded-full ${
              percentage > 90 ? 'bg-red-600' :
              percentage > 70 ? 'bg-yellow-500' :
              'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">0%</span>
          <span className="text-sm text-gray-600">50%</span>
          <span className="text-sm text-gray-600">100%</span>
        </div>
      </div>
    </div>
  );
};

export default DiskMetrics; 