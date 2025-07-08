import React, { useState, useRef } from 'react';
import PageWrapper from './PageWrapper';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import CPUMetrics from '../Monitoring/CPUMetrics';
import MemoryMetrics from '../Monitoring/MemoryMetrics';
import DiskMetrics from '../Monitoring/DiskMetrics';
import NetworkMetrics from '../Monitoring/NetworkMetrics';
import ServicesMetrics from '../Monitoring/ServicesMetrics';
import ProcessesMetrics from '../Monitoring/ProcessesMetrics';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import type { jsPDF as JsPDFType } from 'jspdf';

// Helper to flatten nested objects for details export
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  return Object.keys(obj || {}).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {} as Record<string, any>);
}

async function addSectionImageToPDF(
  doc: JsPDFType,
  sectionId: string,
  title: string,
  description: string,
  yStart = 20,
  newPage = false
): Promise<number> {
  const section = document.getElementById(sectionId);
  if (section) {
    // Set a large enough size for clarity
    section.style.visibility = 'visible';
    section.style.position = 'absolute';
    section.style.left = '-9999px';
    section.style.width = '1200px'; // wider for tables/charts
    section.style.height = 'auto';
    section.style.overflow = 'visible';

    await new Promise(res => setTimeout(res, 800));
    window.dispatchEvent(new Event('resize'));

    const rect = section.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const canvas = await html2canvas(section, { backgroundColor: '#fff', useCORS: true, scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      if (imgData && imgData.startsWith('data:image/png')) {
        if (newPage) {
          doc.addPage();
          yStart = 20;
        }
        let y = yStart;
        doc.setFontSize(15);
        doc.setTextColor(44, 62, 80);
        doc.text(title, 14, y);
        y += 7;
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(1.2);
        doc.line(14, y, 196, y);
        y += 4;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(description, 14, y);
        y += 6;

        // Calculate image size to fit PDF width, maintain aspect ratio
        const pdfWidth = 180;
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        doc.setDrawColor(200, 200, 200);
        doc.rect(14, y, imgWidth, imgHeight, 'S');
        doc.addImage(imgData, 'PNG', 14, y, imgWidth, imgHeight);
        y += imgHeight + 5;
        return y;
      }
    }
  }
  return yStart + 90;
}

const exportSystemPDF = async (system: any, healthRef: any, cloudRef: any) => {
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text(`${system.name} - Full System Report`, 14, y);
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text('System Details', 14, y);
  y += 6;

  // Flatten all details
  const details = flattenObject(system.fullDetails || {});
  const detailsArr = Object.entries(details).map(([k, v]) => [k, String(v)]);

  // Paginate details if needed
  autoTable(doc, {
    startY: y,
    head: [['Field', 'Value']],
    body: detailsArr,
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: any) => {
      if (data && data.cursor && typeof data.cursor.y === 'number') {
        y = data.cursor.y + 10;
      }
    },
  });
  if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) {
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- System Health Section (grouped) ---
  y = await addSectionImageToPDF(
    doc,
    'component-status-section',
    'Component Status Table',
    'Overview of system components and their health status.',
    y,
    true // new page for System Health
  );
  y = await addSectionImageToPDF(
    doc,
    'cpu-metrics-section',
    'CPU Metrics',
    'Charts and statistics for CPU usage.',
    y
  );
  y = await addSectionImageToPDF(
    doc,
    'memory-metrics-section',
    'Memory Metrics',
    'Charts and statistics for memory usage.',
    y
  );
  y = await addSectionImageToPDF(
    doc,
    'network-metrics-section',
    'Network Metrics',
    'Charts and statistics for network activity.',
    y
  );
  y = await addSectionImageToPDF(
    doc,
    'disk-metrics-section',
    'Disk Metrics',
    'Charts and statistics for disk usage.',
    y
  );
  y = await addSectionImageToPDF(
    doc,
    'services-metrics-section',
    'Services Metrics',
    'Table or chart of running services.',
    y
  );
  y = await addSectionImageToPDF(
    doc,
    'processes-metrics-section',
    'Processes Metrics',
    'Table or chart of top processes.',
    y
  );

  // --- CloudWatch Section (grouped, new page) ---
  y = await addSectionImageToPDF(
    doc,
    'cpu-utilization-section',
    'CloudWatch: CPU Utilization',
    'CloudWatch chart for CPU usage.',
    20,
    true // new page for CloudWatch
  );
  y = await addSectionImageToPDF(
    doc,
    'memory-usage-section',
    'CloudWatch: Memory Usage',
    'CloudWatch chart for memory usage.',
    y
  );
  y = await addSectionImageToPDF(
    doc,
    'disk-usage-section',
    'CloudWatch: Disk Usage',
    'CloudWatch chart for disk usage.',
    y
  );
  y = await addSectionImageToPDF(
    doc,
    'network-traffic-section',
    'CloudWatch: Network Traffic',
    'CloudWatch chart for network traffic.',
    y
  );
  y = await addSectionImageToPDF(
    doc,
    'metrics-summary-section',
    'CloudWatch: Metrics Summary Table',
    'Summary table of all key metrics from CloudWatch.',
    y
  );

  doc.save(`${system.name.replace(/\s+/g, '_')}_full_report.pdf`);
};

const Report: React.FC = () => {
  const { data, loading, error } = useFirebaseData();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showExportCharts, setShowExportCharts] = useState<string | null>(null); // system.id or null
  const healthRefs = useRef<Record<string, any>>({});
  const cloudRefs = useRef<Record<string, any>>({});

  // Gather all assets from server-info (same as AssetInventoryPage)
  const systems = Object.values(data?.monitoring?.['server-info'] || {})
    .map((serverInfo: any) => {
      const instanceId = serverInfo?.systemInfo?.basics?.hardware?.serialNumber ||
                        serverInfo?.systemInfo?.basics?.hostname ||
                        serverInfo?.instanceId ||
                        serverInfo?.systemInfo?.basics?.os?.name ||
                        undefined;
      const info: Record<string, any> = (data?.monitoring?.info && data?.monitoring?.info[instanceId]) ? data.monitoring.info[instanceId] : {};
      const full: Record<string, any> = (data?.monitoring?.full && data?.monitoring?.full[instanceId]?.instance) ? data.monitoring.full[instanceId].instance : {};
      return {
        id: instanceId,
        name: serverInfo?.systemInfo?.basics?.hostname || info?.name || '—',
        type: serverInfo?.systemInfo?.basics?.hardware?.model || info?.name || '—',
        health: info?.status || full?.status || '—',
        cloud: info?.cloud || full?.cloud || '—',
        region: info?.region || full?.region || '—',
        fullDetails: { ...serverInfo, ...info, ...full },
      };
    })
    .filter(system => system.id);

  const handleExport = async (system: any) => {
    setShowExportCharts(system.id);
    await new Promise(res => setTimeout(res, 900)); // Wait for modal charts to render
    window.dispatchEvent(new Event('resize'));
    setDownloading(`${system.id}-full`);
    await exportSystemPDF(system, healthRefs.current[system.id], cloudRefs.current[system.id]);
    setDownloading(null);
    setShowExportCharts(null);
  };

  return (
    <PageWrapper title="System Reports">
      <div className="max-w-4xl mx-auto bg-white/90 rounded-lg shadow-lg p-8 mt-6">
        <h2 className="text-xl font-semibold mb-6">Systems List</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading systems...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 mb-8">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">System Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cloud</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Export</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {systems.map(system => (
                <tr key={system.id}>
                  <td className="px-4 py-2 font-medium text-slate-800">{system.name}</td>
                  <td className="px-4 py-2">{system.type}</td>
                  <td className="px-4 py-2">{system.health}</td>
                  <td className="px-4 py-2">{system.cloud}</td>
                  <td className="px-4 py-2">{system.region}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      disabled={downloading === `${system.id}-full`}
                      onClick={() => handleExport(system)}
                    >
                      {downloading === `${system.id}-full` ? 'Exporting...' : 'Export Full Report'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Hidden sections for PDF export */}
      {systems.length > 0 && (
        <div style={{
          opacity: 0,
          pointerEvents: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          width: '1200px',
          background: '#fff',
          overflow: 'visible',
        }}>
          {/* Use the first system as the example for export (or you can loop for each system if needed) */}
          {(() => {
            const system = systems[0];
            const instanceId = system.id;
            const serverInfo = system.fullDetails;
            // SystemHealthPage data
            const cpuData = serverInfo?.cpu;
            const memoryData = serverInfo?.memory?.physical;
            const swapData = serverInfo?.memory?.swap;
            const virtualMemoryData = serverInfo?.memory?.virtualMemory;
            const networkData = serverInfo?.network;
            const storageData = serverInfo?.storage;
            const smartDisks = serverInfo?.smart?.disks || [];
            const processes = serverInfo?.processes;
            // CloudWatchPage data
            const allTimestamps = Object.keys(data?.monitoring?.['server-info'] || {}).sort();
            const metricsData = allTimestamps.map((timestamp, idx) => {
              const sInfo = data?.monitoring?.['server-info'][timestamp];
              if (!sInfo) return null;
              const indexLabel = idx === allTimestamps.length - 1 ? 'Now' : `-${allTimestamps.length - 1 - idx}`;
              return {
                indexLabel,
                cpu: sInfo.cpu.usage.overall,
                memory: (sInfo.memory.physical.used / sInfo.memory.physical.total) * 100,
                diskUsage: sInfo.storage.volumes[0]?.size.percentage || 0,
                networkIn: sInfo.network.connections.established || 0,
                networkOut: sInfo.network.connections.timeWait || 0
              };
            }).filter(Boolean);
            return <>
              {/* System Health Sections */}
              <div id="component-status-section">
                {/* You can copy the table rendering from SystemHealthPage here if needed */}
              </div>
              <div id="cpu-metrics-section">
                {cpuData && <CPUMetrics data={cpuData} instanceId={instanceId} />}
              </div>
              <div id="memory-metrics-section">
                {memoryData && swapData && virtualMemoryData && (
                  <MemoryMetrics data={memoryData} swap={swapData} virtualMemory={virtualMemoryData} instanceId={instanceId} />
                )}
              </div>
              <div id="network-metrics-section">
                {networkData && <NetworkMetrics networkData={networkData} instanceId={instanceId} />}
              </div>
              <div id="disk-metrics-section">
                {storageData && <DiskMetrics data={storageData} smartDisks={smartDisks} />}
              </div>
              <div id="services-metrics-section">
                {processes?.topProcesses?.cpu && <ServicesMetrics data={processes.topProcesses.cpu} instanceId={instanceId} />}
              </div>
              <div id="processes-metrics-section">
                {processes?.summary && processes?.topProcesses?.cpu && processes?.topProcesses?.memory && (
                  <ProcessesMetrics summary={processes.summary} topCPU={processes.topProcesses.cpu} topMemory={processes.topProcesses.memory} instanceId={instanceId} />
                )}
              </div>
              {/* CloudWatch Sections */}
              <div id="cpu-utilization-section" style={{ width: 1200, height: 400 }}>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">CPU Utilization</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                      <XAxis dataKey="indexLabel" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #7F1DFF', boxShadow: '0 4px 24px #7F1DFF22' }} labelStyle={{ color: '#7F1DFF' }} />
                      <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
                      <Bar dataKey="cpu" name="CPU Usage (%)" isAnimationActive={true} label={{ position: 'top', fill: '#7F1DFF', fontWeight: 700, fontSize: 12, formatter: (v: number) => `${v}%` }} />
                      <Line type="monotone" dataKey="cpu" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4, fill: '#F43F5E' }} name="Trend" isAnimationActive={true} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div id="memory-usage-section" style={{ width: 1200, height: 400 }}>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Memory Usage</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                      <XAxis dataKey="indexLabel" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #00E6D8', boxShadow: '0 4px 24px #00E6D822' }} labelStyle={{ color: '#00E6D8' }} />
                      <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
                      <Area type="monotone" dataKey="memory" stroke="#00E6D8" fill="#00E6D8" strokeWidth={3} name="Memory Usage (%)" dot={{ r: 4, fill: '#00E6D8', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={true} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div id="disk-usage-section" style={{ width: 1200, height: 400 }}>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Disk Usage</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                      <XAxis dataKey="indexLabel" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #FFB300', boxShadow: '0 4px 24px #FFB30022' }} labelStyle={{ color: '#FFB300' }} />
                      <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
                      <Area type="monotone" dataKey="diskUsage" stroke="#FFB300" fill="#FFB300" strokeWidth={3} name="Disk Usage (%)" dot={{ r: 4, fill: '#FFB300', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={true} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div id="network-traffic-section" style={{ width: 1200, height: 400 }}>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Network Traffic</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                      <XAxis dataKey="indexLabel" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '0.75rem', border: '1px solid #0891B2', boxShadow: '0 4px 24px #0891B222' }} labelStyle={{ color: '#0891B2' }} />
                      <Legend iconType="circle" wrapperStyle={{ color: '#64748B', fontWeight: 600 }} />
                      <Bar dataKey="networkIn" name="Connections In" fill="#0891B2" isAnimationActive={true} label={{ position: 'top', fill: '#0891B2', fontWeight: 700, fontSize: 12 }} />
                      <Bar dataKey="networkOut" name="Connections Out" fill="#F43F5E" isAnimationActive={true} label={{ position: 'top', fill: '#F43F5E', fontWeight: 700, fontSize: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div id="metrics-summary-section">
                <h2 className="text-lg font-semibold text-black-100 mb-4">Metrics Summary</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/30">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">CPU Usage</th>
                        <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">Memory Usage</th>
                        <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">Disk Usage</th>
                        <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">Network In</th>
                        <th className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-left text-xs font-medium text-black-500 uppercase tracking-wider">Network Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricsData.map((row, idx) => (
                        row ? (
                          <tr key={idx}>
                            <td className="px-6 py-2 text-sm text-gray-700">{row.indexLabel}</td>
                            <td className="px-6 py-2 text-sm text-gray-700">{row.cpu.toFixed(1)}%</td>
                            <td className="px-6 py-2 text-sm text-gray-700">{row.memory.toFixed(1)}%</td>
                            <td className="px-6 py-2 text-sm text-gray-700">{row.diskUsage.toFixed(1)}%</td>
                            <td className="px-6 py-2 text-sm text-gray-700">{row.networkIn}</td>
                            <td className="px-6 py-2 text-sm text-gray-700">{row.networkOut}</td>
                          </tr>
                        ) : null
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>;
          })()}
        </div>
      )}
      {/* End hidden sections */}
    </PageWrapper>
  );
};

export default Report; 