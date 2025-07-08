import React from 'react';
import { AlertTriangle, Bell, CheckCircle, XCircle } from 'lucide-react';
import PageWrapper from './PageWrapper';
import { useFirebaseData } from '../../hooks/useFirebaseData';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

interface Notification {
  id: string;
  type: 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

const extractAlertsNotifications = (latestData: any) => {
  const alerts: Alert[] = [];
  const notifications: Notification[] = [];
  const timestamp = latestData?.timestamp || new Date().toISOString();
  let alertId = 1;
  let notificationId = 1;

  // High CPU Usage
  const cpuUsage = latestData?.cpu?.usage?.overall;
  if (cpuUsage !== undefined && cpuUsage > 90) {
    alerts.push({
      id: String(alertId++),
      type: 'critical',
      title: 'High CPU Usage',
      message: `CPU usage is ${cpuUsage}%.`,
      timestamp,
      status: 'active',
    });
  }

  // Low Available Memory
  const memAvailable = latestData?.memory?.physical?.available;
  if (memAvailable !== undefined && memAvailable < 2000) {
    alerts.push({
      id: String(alertId++),
      type: 'warning',
      title: 'Low Available Memory',
      message: `Available memory is ${memAvailable} MB.`,
      timestamp,
      status: 'active',
    });
  }

  // Backup Error
  const backupError = latestData?.backups?.error;
  if (backupError) {
    notifications.push({
      id: String(notificationId++),
      type: 'error',
      title: 'Backup Error',
      message: backupError,
      timestamp,
    });
  }

  // Disk Almost Full
  const volumes = latestData?.storage?.volumes || [];
  for (const vol of volumes) {
    const percent = vol?.size?.percentage;
    const device = vol?.device;
    if (percent !== undefined && percent > 90) {
      alerts.push({
        id: String(alertId++),
        type: 'warning',
        title: 'Disk Almost Full',
        message: `Disk ${device} is ${percent}% full.`,
        timestamp,
        status: 'active',
      });
    }
  }

  return { alerts, notifications };
};

const AlertsPage: React.FC = () => {
  const { data, loading, error } = useFirebaseData();

  let alerts: Alert[] = [];
  let notifications: Notification[] = [];

  if (!loading && data && data.monitoring && data.monitoring['server-info']) {
    const timestamps = Object.keys(data.monitoring['server-info']).sort().reverse();
    const latestData = data.monitoring['server-info'][timestamps[0]];
    const extracted = extractAlertsNotifications(latestData);
    alerts = extracted.alerts;
    notifications = extracted.notifications;
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50/90 border-red-200/50';
      case 'warning':
        return 'bg-yellow-50/90 border-yellow-200/50';
      case 'success':
        return 'bg-green-50/90 border-green-200/50';
      default:
        return 'bg-blue-50/90 border-blue-200/50';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <PageWrapper title="Alerts & Notifications">
      <div className="flex justify-end gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm">
          Mark All as Read
        </button>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all shadow-sm">
          Configure Alerts
        </button>
      </div>

      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 mb-8">
        <div className="p-6 border-b border-gray-200/30">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-black-1000 text-slate-1200">Recent Alerts</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-red-100/80 text-red-800 rounded-full text-sm font-medium backdrop-blur-sm">
                {alerts.filter(a => a.type === 'critical').length} Critical
              </span>
              <span className="px-3 py-1 bg-yellow-100/80 text-yellow-800 rounded-full text-sm font-medium backdrop-blur-sm">
                {alerts.filter(a => a.type === 'warning').length} Warning
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200/30">
          {alerts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No alerts</div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 flex items-start gap-4 ${getAlertStyles(alert.type)} backdrop-blur-sm`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-slate-800">{alert.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View Details
                    </button>
                    {alert.status === 'active' && (
                      <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20">
        <div className="p-6 border-b border-gray-200/30">
          <h2 className="text-lg font-semibold text-black-1000 text-slate-1200">Notifications</h2>
        </div>
        <div className="divide-y divide-gray-200/30">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 flex items-start gap-4 bg-blue-50/90 border-blue-200/50 backdrop-blur-sm`}
              >
                <Bell className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-slate-800">{notification.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default AlertsPage; 