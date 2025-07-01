import React from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { RefreshCw, AlertCircle, Download, Users, Database } from 'lucide-react';
import PageWrapper from './PageWrapper';

const SettingsPage: React.FC = () => {
  const { data, loading, error } = useFirebaseData();

  // Get the latest timestamp's data
  const timestamps = Object.keys(data?.monitoring?.['server-info'] || {}).sort().reverse();
  const latestTimestamp = timestamps[0];
  const serverInfo = latestTimestamp ? data?.monitoring?.['server-info'][latestTimestamp] : null;

  // Dummy backup info
  const backupError = serverInfo?.backups?.error;
  const lastBackupTime = serverInfo?.backups && typeof serverInfo.backups === 'object' && 'lastBackupTime' in serverInfo.backups && typeof serverInfo.backups.lastBackupTime === 'string'
    ? serverInfo.backups.lastBackupTime
    : 'N/A';

  return (
    <PageWrapper title="Settings & Maintenance">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Backups Module */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg shadow-lg p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Backups
          </h3>
          {backupError ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded p-3 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>Error: {backupError}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-sm text-gray-600">Last Backup:</span>
              <span className="text-lg font-bold text-blue-700">{lastBackupTime}</span>
            </div>
          )}
          <button className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Backups
          </button>
        </div>

        {/* Extra Settings/Actions */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg shadow-lg p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Other Settings</h3>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Configure Alerts
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Logs
          </button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> Manage Users
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SettingsPage; 