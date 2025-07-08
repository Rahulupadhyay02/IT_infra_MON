import React, { useState } from 'react';
import { ResponsiveContainer } from 'recharts';

interface SystemChartProps {
  data: Array<{
    time: string;
    cpu: number;
    memory: number;
    disk: number;
  }>;
}

// Continuous color scale: blue → green → yellow → orange → red
function getHeatColor(value: number) {
  // value: 0-100
  if (value <= 0) return '#00E6D8';
  if (value >= 100) return '#F43F5E';
  // Interpolate between colors
  // 0-25: blue (#00E6D8) → green (#00FF6A)
  // 25-50: green → yellow (#FFEB3B)
  // 50-75: yellow → orange (#FF9800)
  // 75-100: orange → red (#F43F5E)
  if (value < 25) {
    // blue to green
    const t = value / 25;
    return interpolateColor('#00E6D8', '#00FF6A', t);
  } else if (value < 50) {
    const t = (value - 25) / 25;
    return interpolateColor('#00FF6A', '#FFEB3B', t);
  } else if (value < 75) {
    const t = (value - 50) / 25;
    return interpolateColor('#FFEB3B', '#FF9800', t);
  } else {
    const t = (value - 75) / 25;
    return interpolateColor('#FF9800', '#F43F5E', t);
  }
}

function interpolateColor(a: string, b: string, t: number): string {
  // a, b: hex colors, t: 0-1
  const ah = a.replace('#', '');
  const bh = b.replace('#', '');
  const ar = parseInt(ah.substring(0, 2), 16);
  const ag = parseInt(ah.substring(2, 4), 16);
  const ab = parseInt(ah.substring(4, 6), 16);
  const br = parseInt(bh.substring(0, 2), 16);
  const bg = parseInt(bh.substring(2, 4), 16);
  const bb = parseInt(bh.substring(4, 6), 16);
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${rr.toString(16).padStart(2, '0')}${rg.toString(16).padStart(2, '0')}${rb.toString(16).padStart(2, '0')}`;
}

const SystemChart: React.FC<SystemChartProps> = ({ data }) => {
  const metrics = ['cpu', 'memory', 'disk'] as const;
  const metricLabels = ['CPU Usage', 'Memory Usage', 'Disk Usage'];
  // Find max/min for each metric
  const maxVals = metrics.map(m => Math.max(...data.map(d => d[m])));
  const minVals = metrics.map(m => Math.min(...data.map(d => d[m])));
  // Tooltip state
  const [tooltip, setTooltip] = useState<{x: number, y: number, value: number, metric: string, time: string} | null>(null);
  // Animation: store previous colors
  const [cellColors, setCellColors] = React.useState<string[][]>([]);
  React.useEffect(() => {
    // Animate color transitions
    const newColors = data.map((d, i) => metrics.map((metric, j) => getHeatColor(d[metric])));
    if (cellColors.length === 0) {
      setCellColors(newColors);
      return;
    }
    // Animate towards newColors
    let frame = 0;
    const frames = 10;
    const animate = () => {
      frame++;
      setCellColors(prev => prev.map((row, i) => row.map((col, j) => {
        const from = col;
        const to = newColors[i][j];
        if (from === to) return from;
        // Interpolate color
        return interpolateColor(from, to, frame / frames);
      })));
      if (frame < frames) requestAnimationFrame(animate);
    };
    animate();
    // eslint-disable-next-line
  }, [data]);

  // Layout constants
  const cellWidth = 56;
  const cellHeight = 48;
  const rowGap = 24;
  const colGap = 16;
  const labelWidth = 110;
  const topPad = 40;
  const leftPad = labelWidth + 20;
  const chartHeight = metrics.length * (cellHeight + rowGap) - rowGap + topPad + 20;
  const chartWidth = data.length * (cellWidth + colGap) - colGap + leftPad + 20;

  return (
    <div className="h-80 fade-in flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
          {/* Grid lines */}
          {metrics.map((_, j) => (
            <line key={'hgrid' + j} x1={leftPad} y1={topPad + j * (cellHeight + rowGap)} x2={chartWidth - 20} y2={topPad + j * (cellHeight + rowGap)} stroke="#E0E7FF" strokeDasharray="2 2" />
          ))}
          {data.map((_, i) => (
            <line key={'vgrid' + i} x1={leftPad + i * (cellWidth + colGap)} y1={topPad} x2={leftPad + i * (cellWidth + colGap)} y2={chartHeight - 20} stroke="#E0E7FF" strokeDasharray="2 2" />
          ))}
          {/* Metric labels (left, vertically centered) */}
          {metricLabels.map((label, i) => (
            <text key={label} x={labelWidth} y={topPad + i * (cellHeight + rowGap) + cellHeight / 2 + 6} fontSize={18} fill="#334155" fontWeight={700} textAnchor="end">{label}</text>
          ))}
          {/* Time labels (top, centered) */}
          {data.map((d, i) => (
            <text key={d.time} x={leftPad + i * (cellWidth + colGap) + cellWidth / 2} y={topPad - 12} fontSize={15} fill="#64748B" textAnchor="middle">{d.time}</text>
          ))}
          {/* Heatmap cells */}
          {data.map((d, i) => metrics.map((metric, j) => {
            const val = d[metric];
            const isMax = val === maxVals[j];
            const isMin = val === minVals[j];
            const color = cellColors[i]?.[j] || getHeatColor(val);
            return (
              <g key={metric + i}>
                <rect
                  x={leftPad + i * (cellWidth + colGap)}
                  y={topPad + j * (cellHeight + rowGap)}
                  width={cellWidth}
                  height={cellHeight}
                  rx={12}
                  fill={color}
                  style={{ filter: 'drop-shadow(0 2px 8px #0001)', cursor: 'pointer', stroke: isMax ? '#00FF6A' : isMin ? '#7F1DFF' : 'none', strokeWidth: isMax || isMin ? 2 : 0 }}
                  onMouseMove={e => setTooltip({ x: leftPad + i * (cellWidth + colGap) + cellWidth / 2, y: topPad + j * (cellHeight + rowGap) + cellHeight / 2, value: val, metric: metricLabels[j], time: d.time })}
                  onMouseLeave={() => setTooltip(null)}
                />
                {/* Value label */}
                <text
                  x={leftPad + i * (cellWidth + colGap) + cellWidth / 2}
                  y={topPad + j * (cellHeight + rowGap) + cellHeight / 2 + 8}
                  fontSize={22}
                  fill="#fff"
                  fontWeight={800}
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', textShadow: '0 2px 8px #0006' }}
                >
                  {Math.round(val)}%
                </text>
                {/* Max/Min subtle border highlight */}
                {isMax && (
                  <rect x={leftPad + i * (cellWidth + colGap)} y={topPad + j * (cellHeight + rowGap)} width={cellWidth} height={cellHeight} rx={12} fill="none" stroke="#00FF6A" strokeWidth={3} />
                )}
                {isMin && (
                  <rect x={leftPad + i * (cellWidth + colGap)} y={topPad + j * (cellHeight + rowGap)} width={cellWidth} height={cellHeight} rx={12} fill="none" stroke="#7F1DFF" strokeWidth={3} />
                )}
              </g>
            );
          }))}
          {/* Axis label (Time) */}
          <text x={leftPad + (data.length * (cellWidth + colGap) - colGap) / 2} y={chartHeight - 2} fontSize={16} fill="#64748B" fontWeight={600} textAnchor="middle">Time</text>
          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect x={tooltip.x - 60} y={tooltip.y - 45} width={120} height={44} rx={10} fill="#1e293b" stroke="#7F1DFF" strokeWidth={2} />
              <text x={tooltip.x} y={tooltip.y - 25} fontSize={15} fill="#00E6D8" fontWeight={700} textAnchor="middle">{tooltip.metric}</text>
              <text x={tooltip.x} y={tooltip.y - 7} fontSize={18} fill="#fff" textAnchor="middle">{tooltip.value}%</text>
              <text x={tooltip.x} y={tooltip.y + 13} fontSize={13} fill="#FFB300" textAnchor="middle">{tooltip.time}</text>
            </g>
          )}
        </svg>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-1"><span className="w-6 h-4 rounded" style={{background: getHeatColor(0)}}></span> <span className="text-xs text-slate-600">Low</span></div>
        <div className="flex items-center gap-1"><span className="w-6 h-4 rounded" style={{background: getHeatColor(50)}}></span> <span className="text-xs text-slate-600">Medium</span></div>
        <div className="flex items-center gap-1"><span className="w-6 h-4 rounded" style={{background: getHeatColor(100)}}></span> <span className="text-xs text-slate-600">High</span></div>
      </div>
    </div>
  );
};

export default SystemChart;