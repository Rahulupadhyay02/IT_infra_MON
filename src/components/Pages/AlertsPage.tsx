import React from 'react';
import { AlertTriangle, Bell, CheckCircle, XCircle } from 'lucide-react';
import PageWrapper from './PageWrapper';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

const AlertsPage: React.FC = () => {
  // Sample alerts data - in a real app, this would come from your monitoring system
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'critical',
      title: 'High CPU Usage',
      message: 'EC2 instance i-1234567 CPU usage exceeded 90% for 5 minutes',
      timestamp: '2025-06-23T10:51:46Z',
      status: 'active'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Memory Usage Warning',
      message: 'Available memory below 20% on server prod-db-01',
      timestamp: '2025-06-23T10:45:00Z',
      status: 'active'
    },
    {
      id: '3',
      type: 'success',
      title: 'Service Restored',
      message: 'Web service successfully restarted after automated recovery',
      timestamp: '2025-06-23T10:30:00Z',
      status: 'resolved'
    }
  ];

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

      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20">
        <div className="p-6 border-b border-gray-200/30">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-black-1000 text-slate-1200">Recent Alerts</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-red-100/80 text-red-800 rounded-full text-sm font-medium backdrop-blur-sm">
                2 Critical
              </span>
              <span className="px-3 py-1 bg-yellow-100/80 text-yellow-800 rounded-full text-sm font-medium backdrop-blur-sm">
                3 Warning
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200/30">
          {alerts.map((alert) => (
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
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default AlertsPage; 