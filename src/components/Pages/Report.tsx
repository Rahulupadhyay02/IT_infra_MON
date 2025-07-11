import React, { useState, useEffect } from 'react';
import PageWrapper from './PageWrapper';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import type { jsPDF as JsPDFType } from 'jspdf';

// Import all necessary components
import CPUMetrics from '../Monitoring/CPUMetrics';
import MemoryMetrics from '../Monitoring/MemoryMetrics';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- HELPER FUNCTIONS ---
function flattenObject(obj: any, prefix = ''): Record<string, any> {
    // This function is now robust
    return Object.keys(obj || {}).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        const key = pre + k;
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], key));
        } else if (Array.isArray(obj[k])) {
            acc[key] = `[${obj[k].length} items]`;
        } else {
            acc[key] = obj[k];
        }
        return acc;
    }, {} as Record<string, any>);
}

async function addSectionToPDF(doc: JsPDFType, sectionId: string, title: string) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    let yPosition = (doc as any).lastAutoTable.finalY || 0;
    
    // Add a new page if there's not enough space for the title and some content
    if (yPosition > 240) {
        doc.addPage();
        yPosition = 0;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, yPosition + 20);

    const canvas = await html2canvas(section, {
        scale: 2, // A scale of 2 is a good balance of quality and performance
        useCORS: true,
        backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdfWidth = doc.internal.pageSize.getWidth() - 28;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    const imgY = yPosition + 28;

    if (imgY + imgHeight > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        doc.addImage(imgData, 'PNG', 14, 20, pdfWidth, imgHeight, undefined, 'FAST');
        // @ts-ignore
        doc.lastAutoTable.finalY = 20 + imgHeight;
    } else {
        doc.addImage(imgData, 'PNG', 14, imgY, pdfWidth, imgHeight, undefined, 'FAST');
        // @ts-ignore
        doc.lastAutoTable.finalY = imgY + imgHeight;
    }
}

// --- REACT COMPONENT ---
const Report: React.FC = () => {
    const { data } = useFirebaseData();
    const [downloading, setDownloading] = useState<string | null>(null);
    const [exportingSystemId, setExportingSystemId] = useState<string | null>(null);

    const systems = React.useMemo(() =>
        Object.values(data?.monitoring?.['server-info'] || {}).map((serverInfo: any) => ({
            id: serverInfo?.systemInfo?.basics?.hardware?.serialNumber || serverInfo?.instanceId || 'N/A',
            name: serverInfo?.systemInfo?.basics?.hostname || 'Unknown System',
            fullDetails: serverInfo,
        })).filter(system => system.id !== 'N/A'),
    [data]);

    useEffect(() => {
        if (!exportingSystemId) return;

        const system = systems.find(s => s.id === exportingSystemId);
        if (!system) return;

        const generatePdf = async () => {
            await new Promise(res => setTimeout(res, 200)); // Short wait for render

            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            doc.text(`${system.name} - Full Report`, 14, 20);
            autoTable(doc, {
                startY: 25,
                head: [['Field', 'Value']],
                body: Object.entries(flattenObject(system.fullDetails || {})),
            });
            
            // Capture all sections sequentially onto new pages for clarity
            doc.addPage();
            // @ts-ignore
            doc.lastAutoTable.finalY = 0;
            await addSectionToPDF(doc, 'sh-cpu-metrics', 'System Health: CPU');

            doc.addPage();
            // @ts-ignore
            doc.lastAutoTable.finalY = 0;
            await addSectionToPDF(doc, 'sh-memory-metrics', 'System Health: Memory');

            doc.addPage();
            // @ts-ignore
            doc.lastAutoTable.finalY = 0;
            await addSectionToPDF(doc, 'cw-cpu-utilization', 'CloudWatch: CPU Utilization');

            doc.addPage();
            // @ts-ignore
            doc.lastAutoTable.finalY = 0;
            await addSectionToPDF(doc, 'cw-memory-usage', 'CloudWatch: Memory Usage');

            doc.save(`${system.name.replace(/\s+/g, '_')}_full_report.pdf`);
            
            setDownloading(null);
            setExportingSystemId(null);
        };

        generatePdf();
    }, [exportingSystemId, systems]);

    const handleExportClick = (system: any) => {
        setDownloading(system.id);
        setExportingSystemId(system.id);
    };

    const systemForExport = systems.find(s => s.id === exportingSystemId);
    const metricsData = React.useMemo(() => {
        const timestamps = Object.keys(data?.monitoring?.['server-info'] || {}).sort();
        return timestamps.map((ts, idx) => ({
            name: idx === timestamps.length - 1 ? 'Now' : `-${timestamps.length - 1 - idx}`,
            cpu: data?.monitoring?.['server-info']?.[ts]?.cpu.usage.overall || 0,
            memory: data?.monitoring?.['server-info']?.[ts] ? (data.monitoring['server-info'][ts].memory.physical.used / data.monitoring['server-info'][ts].memory.physical.total) * 100 : 0,
        }));
    }, [data]);

    return (
        <PageWrapper title="System Reports">
            <style>{`
                .pdf-export-container {
                    position: fixed;
                    left: -9999px; /* Keep it off-screen */
                    top: 0;
                    width: 1100px; /* A fixed, predictable width */
                    background: #ffffff;
                    padding: 15px;
                }
                .export-section {
                    background: #ffffff;
                    padding: 20px;
                    margin-bottom: 20px; /* Add space between components */
                    border: 1px solid #eee; /* Optional: helps visualize boundaries */
                }
                .export-section h3 {
                    font-size: 22px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
            `}</style>
            
            <div className="max-w-4xl mx-auto p-8">
                {/* Visible UI */}
                <h2 className="text-xl font-semibold mb-6">System Reports</h2>
                <table className="min-w-full">
                    <thead className="bg-gray-50"><tr><th className="p-2 text-left">System Name</th><th className="p-2 text-left">Actions</th></tr></thead>
                    <tbody>
                        {systems.map(system => (
                            <tr key={system.id}>
                                <td className="p-2 font-medium">{system.name}</td>
                                <td className="p-2">
                                    <button onClick={() => handleExportClick(system)} disabled={!!downloading}>
                                        {downloading === system.id ? 'Exporting...' : 'Export Report'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Hidden container for PDF rendering */}
            {exportingSystemId && systemForExport && (
                <div className="pdf-export-container">
                    <div id="sh-cpu-metrics" className="export-section">
                        <CPUMetrics data={systemForExport.fullDetails.cpu} instanceId={systemForExport.id} />
                    </div>
                    <div id="sh-memory-metrics" className="export-section">
                        <MemoryMetrics data={systemForExport.fullDetails.memory.physical} swap={systemForExport.fullDetails.memory.swap} virtualMemory={systemForExport.fullDetails.memory.virtualMemory} instanceId={systemForExport.id} />
                    </div>
                    <div id="cw-cpu-utilization" className="export-section">
                        <ResponsiveContainer width="100%" height={350}><BarChart data={metricsData}><CartesianGrid /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="cpu" fill="#8884d8" isAnimationActive={false} /></BarChart></ResponsiveContainer>
                    </div>
                    <div id="cw-memory-usage" className="export-section">
                        <ResponsiveContainer width="100%" height={350}><AreaChart data={metricsData}><CartesianGrid /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="memory" fill="#82ca9d" stroke="#82ca9d" isAnimationActive={false} /></AreaChart></ResponsiveContainer>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default Report;