import React, { useState } from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { 
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import PageWrapper from './PageWrapper';

const ScheduledJobsPage: React.FC = () => {
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
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading scheduled jobs</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  // Sample scheduled jobs data
  const jobs = [
    {
      id: 'job-1',
      name: 'Database Backup',
      description: 'Automated daily database backup',
      schedule: '0 0 * * *', // Every day at midnight
      lastRun: '2024-03-20 00:00:00',
      nextRun: '2024-03-21 00:00:00',
      status: 'active',
      type: 'backup'
    },
    {
      id: 'job-2',
      name: 'Log Rotation',
      description: 'Rotate and compress system logs',
      schedule: '0 1 * * *', // Every day at 1 AM
      lastRun: '2024-03-20 01:00:00',
      nextRun: '2024-03-21 01:00:00',
      status: 'completed',
      type: 'maintenance'
    },
    {
      id: 'job-3',
      name: 'System Health Check',
      description: 'Check system metrics and send alerts',
      schedule: '*/15 * * * *', // Every 15 minutes
      lastRun: '2024-03-20 12:45:00',
      nextRun: '2024-03-20 13:00:00',
      status: 'active',
      type: 'monitoring'
    },
    {
      id: 'job-4',
      name: 'Security Scan',
      description: 'Scan for security vulnerabilities',
      schedule: '0 2 * * *', // Every day at 2 AM
      lastRun: '2024-03-20 02:00:00',
      nextRun: '2024-03-21 02:00:00',
      status: 'failed',
      type: 'security'
    }
  ];

  const filteredJobs = jobs.filter(job => {
    if (selectedFilter === 'active') return job.status === 'active';
    if (selectedFilter === 'completed') return job.status === 'completed';
    if (selectedFilter === 'failed') return job.status === 'failed';
    return true;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length
  };

  return (
    <PageWrapper title="Scheduled Jobs">
      <div className="flex justify-end gap-4 mb-6">
        <button className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg text-gray-700 hover:bg-white/95 transition-all shadow-sm flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          Refresh Jobs
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Job
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Jobs</p>
              <p className="text-2xl font-semibold text-slate-800">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-semibold text-yellow-300">{stats.active}</p>
            </div>
            <Play className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-semibold text-green-700">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Failed</p>
              <p className="text-2xl font-semibold text-red-700">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Controls and Jobs List */}
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
            All Jobs
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

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{job.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{job.description}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>Schedule: {job.schedule}</span>
                    </div>
                    <p className="text-sm text-slate-600">Last Run: {job.lastRun}</p>
                    <p className="text-sm text-slate-600">Next Run: {job.nextRun}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                    job.status === 'completed'
                      ? 'bg-green-100/80 text-green-800'
                      : job.status === 'active'
                      ? 'bg-yellow-100/80 text-yellow-800'
                      : 'bg-red-100/80 text-red-800'
                  }`}>
                    {job.status}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/80 text-blue-800 backdrop-blur-sm">
                    {job.type}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="p-1 hover:text-blue-600 transition-colors">
                  {job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-1 hover:text-blue-600 transition-colors">
                  <RotateCw className="w-4 h-4" />
                </button>
                <button className="p-1 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ScheduledJobsPage; 