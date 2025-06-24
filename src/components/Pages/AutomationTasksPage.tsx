import React, { useState } from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  HardDrive,
  Cpu,
  CircuitBoard,
  Network,
  Plus
} from 'lucide-react';
import MetricCard from '../Dashboard/MetricCard';
import StatusIndicator from '../Dashboard/StatusIndicator';
import PageWrapper from './PageWrapper';

const AutomationTasksPage: React.FC = () => {
  const { data, loading, error } = useFirebaseData();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

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
        <RotateCw className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading automation tasks</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  // Get the latest timestamp's data
  const timestamps = Object.keys(data?.monitoring?.['server-info'] || {}).sort().reverse();
  const latestTimestamp = timestamps[0];
  const serverInfo = latestTimestamp ? data?.monitoring?.['server-info'][latestTimestamp] : null;

  if (!serverInfo) {
    return (
      <div className="text-center py-12">
        <RotateCw className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No automation data</h3>
        <p className="mt-1 text-sm text-gray-500">No server information is currently available.</p>
      </div>
    );
  }

  const { cpu, memory, storage, network, systemInfo } = serverInfo;

  // Generate automation tasks based on real server metrics
  const tasks = [
    {
      id: 'task-1',
      name: 'CPU Load Balancing',
      description: 'Automatically distribute CPU load across cores',
      type: 'performance',
      status: cpu.usage.overall > 80 ? 'active' : 'completed',
      lastRun: systemInfo.basics.os.lastBoot,
      nextRun: 'Every 5 minutes',
      metrics: {
        current: `${cpu.usage.overall.toFixed(1)}% CPU Usage`,
        threshold: '80% CPU Usage'
      },
      icon: Cpu
    },
    {
      id: 'task-2',
      name: 'Memory Cleanup',
      description: 'Clean up unused memory and cache',
      type: 'maintenance',
      status: (memory.physical.used / memory.physical.total) > 0.9 ? 'active' : 'completed',
      lastRun: systemInfo.basics.os.lastBoot,
      nextRun: 'Every 30 minutes',
      metrics: {
        current: `${((memory.physical.used / memory.physical.total) * 100).toFixed(1)}% Memory Usage`,
        threshold: '90% Memory Usage'
      },
      icon: CircuitBoard
    },
    {
      id: 'task-3',
      name: 'Storage Optimization',
      description: 'Monitor and clean up disk space',
      type: 'maintenance',
      status: storage.volumes.some(vol => (vol.size.used / vol.size.total) > 0.9) ? 'active' : 'completed',
      lastRun: systemInfo.basics.os.lastBoot,
      nextRun: 'Every 2 hours',
      metrics: {
        current: storage.volumes.map(vol => {
          const usagePercent = (vol.size.used / vol.size.total) * 100;
          return `${vol.mountPoint}: ${usagePercent.toFixed(1)}%`;
        }).join(', '),
        threshold: '90% Storage Usage'
      },
      icon: HardDrive
    },
    {
      id: 'task-4',
      name: 'Network Connection Monitor',
      description: 'Monitor and optimize network connections',
      type: 'monitoring',
      status: network.connections.established > 1000 ? 'active' : 'completed',
      lastRun: systemInfo.basics.os.lastBoot,
      nextRun: 'Every minute',
      metrics: {
        current: `${network.connections.established} Active Connections`,
        threshold: '1000 Connections'
      },
      icon: Network
    }
  ];

  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'active') return task.status === 'active';
    if (selectedFilter === 'completed') return task.status === 'completed';
    if (selectedFilter === 'failed') return task.status === 'failed';
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'active').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  };

  return (
    <PageWrapper title="Automation Tasks">
      <div className="flex justify-end gap-4 mb-6">
        <button className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg text-gray-700 hover:bg-white/95 transition-all shadow-sm flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          Refresh Tasks
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black-400">Total Tasks</p>
              <p className="text-2xl font-semibold text-slate-800">{stats.total}</p>
            </div>
            <RotateCw className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black-400">Active</p>
              <p className="text-2xl font-semibold text-yellow-300">{stats.active}</p>
            </div>
            <Play className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black-400">Completed</p>
              <p className="text-2xl font-semibold text-green-700">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black-400">Failed</p>
              <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Controls and Tasks Grid */}
      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'all'
                ? 'bg-blue-100/80 text-blue-700 backdrop-blur-sm'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 backdrop-blur-sm'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setSelectedFilter('active')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'active'
                ? 'bg-yellow-100/80 text-yellow-700 backdrop-blur-sm'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 backdrop-blur-sm'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setSelectedFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'completed'
                ? 'bg-green-100/80 text-green-700 backdrop-blur-sm'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 backdrop-blur-sm'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setSelectedFilter('failed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'failed'
                ? 'bg-red-100/80 text-red-700 backdrop-blur-sm'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 backdrop-blur-sm'
            }`}
          >
            Failed
          </button>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const TaskIcon = task.icon;
            return (
              <div key={task.id} className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <TaskIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{task.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-600">Current: {task.metrics.current}</p>
                        <p className="text-sm text-slate-600">Threshold: {task.metrics.threshold}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                    task.status === 'completed'
                      ? 'bg-green-100/80 text-green-800'
                      : task.status === 'active'
                      ? 'bg-yellow-100/80 text-yellow-800'
                      : 'bg-red-100/80 text-red-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Next run: {task.nextRun}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 hover:text-blue-600 transition-colors">
                      {task.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-1 hover:text-blue-600 transition-colors">
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
};

export default AutomationTasksPage;