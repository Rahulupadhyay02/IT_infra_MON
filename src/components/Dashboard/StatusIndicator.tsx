import React from 'react';

interface StatusIndicatorProps {
  status: 'healthy' | 'warning' | 'critical';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center">
      <div className={`w-2.5 h-2.5 rounded-full mr-2 ${getStatusColor()}`} />
      <span className="text-sm font-medium text-gray-700">
        {getStatusText()}
      </span>
    </div>
  );
};

export default StatusIndicator;