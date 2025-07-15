import React, { useState } from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { Server, HardDrive, Cpu, Network, Shield, CircuitBoard, ArrowLeft, Download, Pencil, Eye, FileText } from 'lucide-react';
import PageWrapper from './PageWrapper';
import { ref, update } from 'firebase/database';
import { database } from '../../config/firebase';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

// Utility to convert array of objects to CSV
function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const replacer = (key: string, value: any) => (value === null || value === undefined ? '' : value);
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const defaultEditFields = [
  { key: 'region', label: 'Region' },
  { key: 'status', label: 'Asset State' },
  { key: 'userName', label: 'User Name' },
  { key: 'department', label: 'Department Name' },
  { key: 'location', label: 'Location' },
];

// Helper to get all custom fields (not in defaultEditFields)
function getCustomFields(info: Record<string, any>) {
  return Object.entries(info || {})
    .filter(([k]) => !defaultEditFields.some(f => f.key === k))
    .map(([key, value]) => ({ key, value: String(value) }));
}

// PDF export utility
function exportToPDF(data: any[], filename: string) {
  if (!data.length) return;
  const doc = new jsPDF();
  const columns = [
    'Name', 'Product Name', 'Product Type', 'Operating System', 'Service Tag',
    'Asset State', 'Region', 'User Name', 'Department Name', 'Location'
  ];
  const rows = data.map(row => [
    row.Name,
    row['Product Name'],
    row['Product Type'],
    row['Operating System'],
    row['Service Tag'],
    row['Asset State'],
    row.Region,
    row['User Name'],
    row['Department Name'],
    row.Location
  ]);
  // @ts-ignore
  autoTable(doc, {
    head: [columns],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { top: 20 },
  });
  doc.save(filename);
}

interface AssetInventoryPageProps {
  sidebarCollapsed?: boolean;
}

const AssetInventoryPage: React.FC<AssetInventoryPageProps> = ({ sidebarCollapsed }) => {
  const { data, loading, error } = useFirebaseData();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [editAssetId, setEditAssetId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Gather all assets from server-info
  const assets = Object.values(data?.monitoring?.['server-info'] || {})
    .map((serverInfo: any) => {
      const instanceId = serverInfo?.systemInfo?.basics?.hardware?.serialNumber ||
                        serverInfo?.systemInfo?.basics?.hostname ||
                        serverInfo?.instanceId ||
                        serverInfo?.systemInfo?.basics?.os?.name ||
                        undefined;
      const info: Record<string, any> = (data?.monitoring?.info && data?.monitoring?.info[instanceId]) ? data.monitoring.info[instanceId] : {};
      const full: Record<string, any> = (data?.monitoring?.full && data?.monitoring?.full[instanceId]?.instance) ? data.monitoring.full[instanceId].instance : {};
      return {
        assetId: instanceId,
        name: serverInfo?.systemInfo?.basics?.hostname || info?.name || '—',
        productName: serverInfo?.systemInfo?.basics?.hardware?.model || info?.name || '—',
        productType: info?.type || serverInfo?.systemInfo?.basics?.hardware?.model || '—',
        os: serverInfo?.systemInfo?.basics?.os?.name || '—',
        osVersion: serverInfo?.systemInfo?.basics?.os?.version || '',
        serviceTag: serverInfo?.systemInfo?.basics?.hardware?.serialNumber || '—',
        assetState: info?.status || full?.status || '—',
        region: info?.region || full?.region || '—',
        userName: info?.userName || '—',
        department: info?.department || '—',
        location: info?.location || '—',
        info,
        serverInfo,
      };
    })
    .filter(asset => asset.assetId);

  // Find the selected asset's serverInfo
  const selectedAsset = assets.find(a => a.assetId === selectedAssetId);
  const editAsset = assets.find(a => a.assetId === editAssetId);

  // Export handler (CSV)
  const handleExport = () => {
    const exportData = assets.map(({ name, productName, productType, os, osVersion, serviceTag, assetState, region, userName, department, location }) => ({
      Name: name,
      'Product Name': productName,
      'Product Type': productType,
      'Operating System': os + (osVersion ? ' ' + osVersion : ''),
      'Service Tag': serviceTag,
      'Asset State': assetState,
      Region: region,
      'User Name': userName,
      'Department Name': department,
      Location: location,
    }));
    exportToCSV(exportData, 'asset_inventory.csv');
  };

  // Export handler (PDF)
  const handleExportPDF = () => {
    const exportData = assets.map(({ name, productName, productType, os, osVersion, serviceTag, assetState, region, userName, department, location }) => ({
      Name: name,
      'Product Name': productName,
      'Product Type': productType,
      'Operating System': os + (osVersion ? ' ' + osVersion : ''),
      'Service Tag': serviceTag,
      'Asset State': assetState,
      Region: region,
      'User Name': userName,
      'Department Name': department,
      Location: location,
    }));
    exportToPDF(exportData, 'asset_inventory.pdf');
  };

  // Edit handler (open edit page)
  const handleEdit = (asset: any) => {
    setEditAssetId(asset.assetId);
    setEditFields(defaultEditFields.map(f => ({ ...f, value: asset.info?.[f.key] || '' })));
    setCustomFields(getCustomFields(asset.info));
  };

  // Save handler
  const handleSave = async () => {
    if (!editAsset) return;
    setSaving(true);
    const updates: Record<string, any> = {};
    editFields.forEach(f => {
      // If value is empty, set to null to delete from Firebase
      updates[f.key] = f.value ? f.value : null;
    });
    customFields.forEach(f => {
      // Only update if key is present
      if (f.key) updates[f.key] = f.value ? f.value : null;
    });
    try {
      await update(ref(database, `monitoring/info/${editAsset.assetId}`), updates);
      setEditAssetId(null);
      setEditFields([]);
      setCustomFields([]);
      setSelectedAssetId(null); // Return to list
    } finally {
      setSaving(false);
    }
  };

  // Add custom field
  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  // Remove custom field
  const handleRemoveCustomField = (idx: number) => {
    setCustomFields(customFields.filter((_, i) => i !== idx));
  };

  // Update custom field
  const handleCustomFieldChange = (idx: number, key: string, value: string) => {
    setCustomFields(customFields.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditAssetId(null);
    setEditFields([]);
    setCustomFields([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Server className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading asset inventory</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  // Edit page view
  if (editAssetId && editAsset) {
    const { serverInfo } = editAsset;
    const { systemInfo, cpu, memory, storage, network } = serverInfo;
    return (
      <PageWrapper title={`Edit Asset: ${editAsset.name || editAsset.assetId}`}>
        <button
          className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-800 font-medium"
          onClick={handleCancelEdit}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Edit Asset Info</h3>
          <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
            {/* Editable fields */}
            {editFields.map((field, idx) => (
              <div key={field.key} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={field.value}
                  onChange={e => setEditFields(editFields.map((f, i) => i === idx ? { ...f, value: e.target.value } : f))}
                />
              </div>
            ))}
            {/* Custom fields */}
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-sm">Custom Fields</span>
              <button type="button" className="text-blue-500 hover:underline text-sm" onClick={handleAddCustomField}>+ Add Field</button>
            </div>
            {customFields.map((field, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 flex-1"
                  placeholder="Field Name"
                  value={field.key}
                  onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)}
                />
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 flex-1"
                  placeholder="Value"
                  value={field.value}
                  onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)}
                />
                <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveCustomField(idx)} title="Remove Field">&times;</button>
              </div>
            ))}
            {/* Read-only fields */}
            <div className="mt-6 mb-2 font-semibold text-gray-700">System Details (Read-only)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">Hostname</div>
                <div className="font-mono text-sm">{systemInfo.basics.hostname}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">OS</div>
                <div className="font-mono text-sm">{systemInfo.basics.os.name} {systemInfo.basics.os.version}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Model</div>
                <div className="font-mono text-sm">{systemInfo.basics.hardware.model}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Serial Number</div>
                <div className="font-mono text-sm">{systemInfo.basics.hardware.serialNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Architecture</div>
                <div className="font-mono text-sm">{systemInfo.basics.os.architecture}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Uptime</div>
                <div className="font-mono text-sm">{systemInfo.basics.os.uptime}</div>
              </div>
            </div>
            <div className="mt-6 flex justify-between gap-2">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={handleCancelEdit}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </PageWrapper>
    );
  }

  // Detail view for selected asset
  if (selectedAssetId && selectedAsset) {
    const { serverInfo } = selectedAsset;
    const { systemInfo, cpu, memory, storage, network, firewall } = serverInfo;
    return (
      <PageWrapper title={`Asset: ${selectedAsset?.name || selectedAsset?.assetId}`}>
        <button
          className="flex items-center gap-2 mb-4 text-black bg-white  hover:text-blue-200 font-medium"
          onClick={() => setSelectedAssetId(null)}
        >
          <ArrowLeft className="w-7 h-4" /> Back...
        </button>
        <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20">
          <div className="px-6 py-4 border-b border-gray-200/30">
            <div className="flex items-center space-x-3">
              <Server className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-black-400">{selectedAsset?.name || selectedAsset?.assetId}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/80 text-green-800 backdrop-blur-sm">
                Active
              </span>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Information */}
              <div id="system-info-section" className="space-y-4">
                <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  System Information
                </h3>
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-sm">
                  <div>
                    <p className="text-sm text-slate-600">Operating System</p>
                    <p className="text-sm font-medium text-slate-800">{systemInfo.basics.os.name} {systemInfo.basics.os.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Hostname</p>
                    <p className="text-sm font-medium text-slate-800">{systemInfo.basics.hostname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Architecture</p>
                    <p className="text-sm font-medium text-slate-800">{systemInfo.basics.os.architecture}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Uptime</p>
                    <p className="text-sm font-medium text-slate-800">{systemInfo.basics.os.uptime}</p>
                  </div>
                  {/* Unique EC2 field: Kernel */}
                  {systemInfo.basics.os.kernel && (
                    <div>
                      <p className="text-sm text-slate-600">Kernel</p>
                      <p className="text-sm font-medium text-slate-800">{systemInfo.basics.os.kernel}</p>
                    </div>
                  )}
                  {/* Unique EC2 field: Last Boot */}
                  {systemInfo.basics.os.lastBoot && (
                    <div>
                      <p className="text-sm text-slate-600">Last Boot</p>
                      <p className="text-sm font-medium text-slate-800">{systemInfo.basics.os.lastBoot}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hardware Information */}
              <div id="hardware-info-section" className="space-y-4">
                <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                  <CircuitBoard className="w-4 h-4 text-blue-500" />
                  Hardware Information
                </h3>
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-sm">
                  <div>
                    <p className="text-sm text-slate-600">Model</p>
                    <p className="text-sm font-medium text-slate-800">{systemInfo.basics.hardware.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Manufacturer</p>
                    <p className="text-sm font-medium text-slate-800">{systemInfo.basics.hardware.manufacturer}</p>
                  </div>
                  {/* Unique EC2 field: BIOS Version */}
                  {systemInfo.basics.hardware.biosVersion && (
                    <div>
                      <p className="text-sm text-slate-600">BIOS Version</p>
                      <p className="text-sm font-medium text-slate-800">{systemInfo.basics.hardware.biosVersion}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600">Serial Number</p>
                    <p className="text-sm font-medium text-slate-800">{systemInfo.basics.hardware.serialNumber}</p>
                  </div>
                </div>
              </div>

              {/* Unique EC2 field: Firewall Status */}
            {/* Firewall Status */}
            <div id="firewall-status-section" className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm flex flex-col items-start">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Firewall Status</h3>
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${serverInfo.firewall.domain === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Domain: {serverInfo.firewall.domain}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${serverInfo.firewall.private === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Private: {serverInfo.firewall.private}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${serverInfo.firewall.public === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Public: {serverInfo.firewall.public}</span>
              </div>
            </div>

              {/* CPU Information */}
              <div id="cpu-info-section" className="space-y-4">
                <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  CPU Information
                </h3>
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-sm">
                  <div>
                    <p className="text-sm text-slate-600">Model</p>
                    <p className="text-sm font-medium text-slate-800">{cpu.hardware.modelName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Cores / Threads</p>
                    <p className="text-sm font-medium text-slate-800">{cpu.hardware.cores} cores / {cpu.hardware.threads} threads</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Current Usage</p>
                    <p className="text-sm font-medium text-slate-800">{cpu.usage.overall.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Base / Max Speed</p>
                    <p className="text-sm font-medium text-slate-800">{cpu.hardware.baseSpeed} / {cpu.hardware.maxSpeed} MHz</p>
                  </div>
                </div>
              </div>

              {/* Memory Information */}
              <div id="memory-info-section" className="space-y-4">
                <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                  <CircuitBoard className="w-4 h-4 text-blue-500" />
                  Memory Information
                </h3>
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-sm">
                  <div>
                    <p className="text-sm text-slate-600">Used Memory</p>
                    <p className="text-sm font-medium text-slate-800">
                      {(memory.physical.used / 100).toFixed(2)} GB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Buffer Memory</p>
                    <p className="text-sm font-medium text-slate-800">
                      {(memory.physical.buffers / 100).toFixed(2)} GB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Free Memory</p>
                    <p className="text-sm font-medium text-slate-800">
                      {((memory.physical.total - memory.physical.used - memory.physical.buffers) / 100).toFixed(2)} GB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Memory</p>
                    <p className="text-sm font-medium text-slate-800">
                      {(memory.physical.total / 100).toFixed(2)} GB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Usage</p>
                    <p className="text-sm font-medium text-slate-800">
                      {((memory.physical.used / memory.physical.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            {/* Storage Details */}
            <div id="storage-volumes-section" className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Storage Details</h3>
              <div className="space-y-4">
                {storage.volumes.map((volume, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">{volume.mountPoint}</span>
                      <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                        volume.smart.status === 'OK' ? 'bg-green-100/80 text-green-800' : 'bg-red-100/80 text-red-800'
                      }`}>
                        {volume.smart.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {(volume.size.used / 1024).toFixed(2)} GB used of {(volume.size.total / 1024).toFixed(2)} GB
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          volume.size.percentage > 90 ? 'bg-red-500' :
                          volume.size.percentage > 70 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${volume.size.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          {/* Resource Usage */}
          <div id="monitoring-section" className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm md col-span-2">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Resource Usage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">CPU Usage</span>
                    <span className="text-sm font-medium text-slate-800">{cpu.usage.overall.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${cpu.usage.overall}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Memory Usage</span>
                    <span className="text-sm font-medium text-slate-800">
                      {((memory.physical.used / memory.physical.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <div 
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(memory.physical.used / memory.physical.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Storage Usage</span>
                    <span className="text-sm font-medium text-slate-800">
                      {storage.volumes[0]?.size.percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${storage.volumes[0]?.size.percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
           </div>

              {/* Network Information */}
              <div id="network-info-section" className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-semibold text-black-450 flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-500" />
                  Network Information
                </h3>
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Active Connections</p>
                      <p className="text-sm font-medium text-slate-800">{network.connections.established}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Connections</p>
                      <p className="text-sm font-medium text-slate-800">{network.connections.total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">DNS Response Time</p>
                      <p className="text-sm font-medium text-slate-800">{network.dns.responseTime} ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // List view (Grid/Table)
  return (
    <PageWrapper title="Asset Inventory" sidebarCollapsed={sidebarCollapsed}>
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black-400">Assets ({assets.length})</h2>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={handleExport}
              title="Export as CSV"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={handleExportPDF}
              title="Export as PDF"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operating System</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Tag</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset State</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center text-gray-500">No assets found</td>
                </tr>
              ) : (
                assets.map(asset => (
                  <tr key={asset.assetId} className="hover:bg-gray-100 transition group">
                    <td className="px-4 py-2 font-medium text-slate-800">{asset.name}</td>
                    <td className="px-4 py-2">{asset.productName}</td>
                    <td className="px-4 py-2">{asset.productType}</td>
                    <td className="px-4 py-2">{asset.os} {asset.osVersion}</td>
                    <td className="px-4 py-2">{asset.serviceTag}</td>
                    <td className="px-4 py-2">{asset.assetState}</td>
                    <td className="px-4 py-2">{asset.region}</td>
                    <td className="px-4 py-2">{asset.userName}</td>
                    <td className="px-4 py-2">{asset.department}</td>
                    <td className="px-4 py-2">{asset.location}</td>
                    <td className="px-4 py-2 text-right flex gap-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={e => { e.stopPropagation(); setSelectedAssetId(asset.assetId); }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={e => { e.stopPropagation(); handleEdit(asset); }}
                        title="Edit Asset"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AssetInventoryPage; 