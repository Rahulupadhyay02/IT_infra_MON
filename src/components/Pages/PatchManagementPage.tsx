import React, { useState } from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { Package, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Download } from 'lucide-react';
import PageWrapper from './PageWrapper';

const PatchManagementPage: React.FC = () => {
  const { data, loading, error } = useFirebaseData();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'critical'>('all');

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
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading patch information</h3>
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
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No patch data</h3>
        <p className="mt-1 text-sm text-gray-500">No server information is currently available.</p>
      </div>
    );
  }

  const { systemInfo } = serverInfo;
  
  // Extract package information
  const packages = [
    {
      name: 'System Kernel',
      currentVersion: systemInfo.basics.os.kernel,
      status: 'up-to-date',
      type: 'system',
      lastUpdated: systemInfo.basics.os.lastBoot,
      criticality: 'high'
    },
    {
      name: 'Operating System',
      currentVersion: `${systemInfo.basics.os.name} ${systemInfo.basics.os.version}`,
      status: 'up-to-date',
      type: 'system',
      lastUpdated: systemInfo.basics.os.lastBoot,
      criticality: 'high'
    },
    {
      name: 'Security Updates',
      currentVersion: 'Latest',
      status: 'pending',
      type: 'security',
      lastUpdated: systemInfo.basics.os.lastBoot,
      criticality: 'critical'
    },
    {
      name: 'System Libraries',
      currentVersion: 'Various',
      status: 'up-to-date',
      type: 'library',
      lastUpdated: systemInfo.basics.os.lastBoot,
      criticality: 'medium'
    }
  ];

  const filteredPackages = packages.filter(pkg => {
    if (selectedFilter === 'pending') return pkg.status === 'pending';
    if (selectedFilter === 'critical') return pkg.criticality === 'critical';
    return true;
  });

  const stats = {
    total: packages.length,
    upToDate: packages.filter(p => p.status === 'up-to-date').length,
    pending: packages.filter(p => p.status === 'pending').length,
    critical: packages.filter(p => p.criticality === 'critical').length
  };

  return (
    <PageWrapper title="Patch Management">
      <div className="flex justify-end gap-4 mb-6">
        <button className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg text-gray-700 hover:bg-white/95 transition-all shadow-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Check for Updates
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2">
          <Download className="w-4 h-4" />
          Install Updates
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black-400">Total Packages</p>
              <p className="text-2xl font-semibold text-slate-800">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black-400">Up to Date</p>
              <p className="text-2xl font-semibold text-green-600">{stats.upToDate}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-300" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black-400">Pending Updates</p>
              <p className="text-2xl font-semibold text-yellow-300">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black-400">Critical Updates</p>
              <p className="text-2xl font-semibold text-red-600">{stats.critical}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Controls and Table */}
      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'all'
                ? 'bg-blue-100/80 text-blue-700 backdrop-blur-sm'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 backdrop-blur-sm'
            }`}
          >
            All Packages
          </button>
          <button
            onClick={() => setSelectedFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'pending'
                ? 'bg-yellow-100/80 text-yellow-700 backdrop-blur-sm'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 backdrop-blur-sm'
            }`}
          >
            Pending Updates
          </button>
          <button
            onClick={() => setSelectedFilter('critical')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'critical'
                ? 'bg-red-100/80 text-red-700 backdrop-blur-sm'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 backdrop-blur-sm'
            }`}
          >
            Critical Updates
          </button>
        </div>

        {/* Packages Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/30">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Package Name
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Current Version
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Criticality
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/30">
              {filteredPackages.map((pkg, index) => (
                <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                    {pkg.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {pkg.currentVersion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                      pkg.status === 'up-to-date'
                        ? 'bg-green-100/80 text-green-800'
                        : pkg.status === 'pending'
                        ? 'bg-yellow-100/80 text-yellow-800'
                        : 'bg-red-100/80 text-red-800'
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {pkg.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {pkg.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                      pkg.criticality === 'high'
                        ? 'bg-orange-100/80 text-orange-800'
                        : pkg.criticality === 'critical'
                        ? 'bg-red-100/80 text-red-800'
                        : 'bg-blue-100/80 text-blue-800'
                    }`}>
                      {pkg.criticality}
                    </span>
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

export default PatchManagementPage;