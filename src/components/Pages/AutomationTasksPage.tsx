import React from 'react';
import { useAutomationTasks } from '../../hooks/useAutomationTasks';
import PageWrapper from './PageWrapper';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AutomationTasksPageProps {
  sidebarCollapsed?: boolean;
}

const AutomationTasksPage: React.FC<AutomationTasksPageProps> = ({ sidebarCollapsed }) => {
  const { tasks, loading, error, deleteTask } = useAutomationTasks();
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  // Add the getScheduleLabel helper function from ScheduledJobsPage
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

  return (
    <PageWrapper title="Automation Tasks" sidebarCollapsed={sidebarCollapsed}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold"> Task List </h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/automation-tasks/add')}
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="animate-spin w-6 h-6 text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No automation tasks found</td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id}>
                    <td className="px-4 py-2 font-medium text-slate-800">{task.name}</td>
                    <td className="px-4 py-2">{task.type}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${task.status === 'completed' ? 'bg-green-100 text-green-800' : task.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{task.status}</span>
                    </td>
                    <td className="px-4 py-2">{getScheduleLabel(task.schedule)}</td>
                    <td className="px-4 py-2">{task.lastRun || '—'}</td>
                    <td className="px-4 py-2">{task.nextRun || '—'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button className="text-blue-500 hover:text-blue-700" onClick={() => navigate(`/automation-tasks/edit/${task.id}`)} title="Edit"><Edit className="w-4 h-4" /></button>
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(task.id)} title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
};

export default AutomationTasksPage;