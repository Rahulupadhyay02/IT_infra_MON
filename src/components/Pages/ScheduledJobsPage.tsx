import React, { useState } from 'react';
import { useAutomationTasks } from '../../hooks/useAutomationTasks';
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
  Trash2,
  Pencil
} from 'lucide-react';
import PageWrapper from './PageWrapper';

interface ScheduledJobsPageProps {
  sidebarCollapsed?: boolean;
}
const ScheduledJobsPage: React.FC<ScheduledJobsPageProps> = ({ sidebarCollapsed }) => {
  const { tasks: jobs, loading, error } = useAutomationTasks();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const [solvingJobId, setSolvingJobId] = useState<string | null>(null);
  const [solveComment, setSolveComment] = useState('');
  const [editingCommentJobId, setEditingCommentJobId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const { updateTask } = useAutomationTasks();

  const handleSolve = (jobId: string) => {
    setSolvingJobId(jobId);
    setSolveComment('');
  };

  const handleSolveSubmit = async (jobId: string) => {
    // Find the job's current status before marking as completed
    const job = jobs.find(j => j.id === jobId);
    const previousStatus = job?.status && job.status !== 'completed' ? job.status : 'active';
    await updateTask(jobId, { status: 'completed', result: solveComment, previousStatus });
    setSolvingJobId(null);
    setSolveComment('');
  };

  const handleEditComment = (job: any) => {
    setEditingCommentJobId(job.id);
    setEditComment(job.result || '');
  };

  const handleEditCommentSubmit = async (jobId: string) => {
    if (!editComment.trim()) {
      await updateTask(jobId, { status: 'active', result: '', previousStatus: null });
    } else {
      await updateTask(jobId, { result: editComment });
    }
    setEditingCommentJobId(null);
    setEditComment('');
  };

  const handleDeleteComment = async (jobId: string) => {
    await updateTask(jobId, { result: '' });
  };

  const handleEditJob = (job: any) => {
    setEditingCommentJobId(job.id);
    setEditComment(job.result || '');
  };

  // Replace schedule display with a helper function for friendly labels
  const getScheduleLabel = (cron: string) => {
    switch (cron) {
      case '0 0 * * *':
        return 'Every day at midnight';
      case '0 * * * *':
        return 'Every hour';
      case '*/15 * * * *':
        return 'Every 15 minutes';
      case '0 2 * * 0':
        return 'Every Sunday at 2:00 AM';
      default:
        return cron;
    }
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
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading scheduled jobs</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  const filteredJobs = jobs.filter(job => {
    if (selectedFilter === 'active') return job.status === 'active';
    if (selectedFilter === 'completed') return job.status === 'completed';
    if (selectedFilter === 'failed') return job.status === 'failed';
    // 'all' now means all except completed
    return job.status !== 'completed';
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length
  };

  return (
    <PageWrapper title="Scheduled Jobs" sidebarCollapsed={sidebarCollapsed}>
      <div className="flex justify-end gap-4 mb-6">
        <button className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/20 rounded-lg text-gray-700 hover:bg-white/95 transition-all shadow-sm flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          Refresh Jobs
        </button>
        {/*
          The 'New Job' button is intentionally removed.
          This page is only for viewing and solving scheduled jobs, not for creating new ones.
        */}
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
            job.status === 'completed' && selectedFilter === 'completed' ? (
              // Completed job layout
              <div key={job.id} className="bg-green-50/80 border border-green-400/60 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    {editingCommentJobId === job.id ? (
                      <div className="mt-2">
                        <textarea
                          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                          placeholder="Edit comment"
                          value={editComment}
                          onChange={e => setEditComment(e.target.value)}
                        />
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                          onClick={() => handleEditCommentSubmit(job.id)}
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          onClick={() => setEditingCommentJobId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" /> {job.name}
                        </h3>
                        <p className="text-sm text-green-700 mt-1">{job.description}</p>
                        <span className="block text-xs text-green-700">Schedule: {getScheduleLabel(job.schedule)}</span>
                        {job.result ? (
                          <div className="mt-2 p-2 bg-green-100/80 rounded text-green-900 text-xs flex items-start gap-2">
                            <div className="flex-1">
                              <strong>Comment:</strong> {job.result}
                            </div>
                            <div className="flex flex-col gap-1">
                              <button className="text-blue-600 hover:text-blue-800 text-xs underline" onClick={() => handleEditComment(job)}>Edit</button>
                            </div>
                          </div>
                        ) : null}
                        {job.target && (
                          <p className="text-xs text-slate-700">Target: {job.target}</p>
                        )}
                        {job.createdBy && (
                          <p className="text-xs text-slate-700">Created By: {job.createdBy}</p>
                        )}
                        {job.result && selectedFilter !== 'completed' && (
                          <p className="text-xs text-slate-700">Result: {job.result}</p>
                        )}
                        {Object.entries(job).map(([key, value]) => (
                          !['id','name','description','type','status','schedule','lastRun','nextRun','result','createdBy','target','previousStatus'].includes(key) && value ? (
                            <p key={key} className="text-xs text-slate-700">{key}: {String(value)}</p>
                          ) : null
                        ))}
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Completed</span>
                    <span className="text-xs text-green-700">{job.type}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Non-completed job layout (active, failed, etc.)
              <div key={job.id} className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{job.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{job.description}</p>
                    <span>Schedule: {getScheduleLabel(job.schedule)}</span>
                    {solvingJobId === job.id && (
                      <div className="mt-2">
                        <textarea
                          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                          placeholder="Enter your comment"
                          value={solveComment}
                          onChange={e => setSolveComment(e.target.value)}
                        />
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                          onClick={() => handleSolveSubmit(job.id)}
                        >
                          Submit
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          onClick={() => setSolvingJobId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {job.target && (
                      <p className="text-xs text-slate-700">Target: {job.target}</p>
                    )}
                    {job.createdBy && (
                      <p className="text-xs text-slate-700">Created By: {job.createdBy}</p>
                    )}
                    {job.result && selectedFilter !== 'completed' && (
                      <p className="text-xs text-slate-700">Result: {job.result}</p>
                    )}
                    {Object.entries(job).map(([key, value]) => (
                      !['id','name','description','type','status','schedule','lastRun','nextRun','result','createdBy','target','previousStatus'].includes(key) && value ? (
                        <p key={key} className="text-xs text-slate-700">{key}: {String(value)}</p>
                      ) : null
                    ))}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${job.status === 'failed' ? 'bg-red-100 text-red-800' : job.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{job.status}</span>
                    <span className="text-xs text-slate-500">{job.type}</span>
                    {/* Solve icon */}
                    {job.status !== 'completed' && (
                      <button className="text-green-600 hover:text-green-800 mt-2" title="Solve" onClick={() => handleSolve(job.id)}>
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button className="text-red-500 hover:text-red-700 mt-2" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ScheduledJobsPage; 