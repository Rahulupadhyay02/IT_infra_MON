import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemChartProps {
  data: Array<{
    time: string;
    cpu: number;
    memory: number;
    disk: number;
  }>;
}

const SystemChart: React.FC<SystemChartProps> = ({ data }) => {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="cpu" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="CPU Usage (%)"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="memory" 
            stroke="#14B8A6" 
            strokeWidth={2}
            name="Memory Usage (%)"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="disk" 
            stroke="#F97316" 
            strokeWidth={2}
            name="Disk Usage (%)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemChart;