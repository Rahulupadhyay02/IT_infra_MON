import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SystemChartProps {
  data: Array<{
    time: string;
    cpu: number;
    memory: number;
    disk: number;
  }>;
}

const SystemChart: React.FC<SystemChartProps> = ({ data }) => {
  return (
    <div className="h-80 fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis dataKey="time" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: '0.75rem', border: '1px solid #e0e7ff' }} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="cpu" 
            stroke="#6366f1" 
            fill="url(#cpuGradient)"
            strokeWidth={3}
            name="CPU Usage (%)"
            dot={false}
            isAnimationActive={true}
          />
          <Area 
            type="monotone" 
            dataKey="memory" 
            stroke="#14b8a6" 
            fill="url(#memoryGradient)"
            strokeWidth={3}
            name="Memory Usage (%)"
            dot={false}
            isAnimationActive={true}
          />
          <Area 
            type="monotone" 
            dataKey="disk" 
            stroke="#f59e42" 
            fill="url(#diskGradient)"
            strokeWidth={3}
            name="Disk Usage (%)"
            dot={false}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemChart;