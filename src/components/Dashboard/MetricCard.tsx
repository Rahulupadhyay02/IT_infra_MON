import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  value: number | string;
  label: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ value, label, trend }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg p-5 shadow-lg">
      <div className="flex flex-col">
        <div className="text-3xl font-bold text-slate-800 mb-1">
          {value}
        </div>
        <div className="text-sm text-gray-700 mb-3">
          {label}
        </div>
        {trend && (
          <div className="flex items-center text-xs">
            {trend.direction === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className="text-gray-700">{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;