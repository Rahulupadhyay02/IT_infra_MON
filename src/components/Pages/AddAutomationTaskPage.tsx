import React, { useState } from 'react';
import { useAutomationTasks, AutomationTask } from '../../hooks/useAutomationTasks';
import PageWrapper from './PageWrapper';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const typeOptions = [
  { value: 'backup', label: 'Backup' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'security', label: 'Security' },
  { value: 'system', label: 'System' },
  { value: 'custom', label: 'Custom' },
];
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];
const scheduleOptions = [
  { value: '0 0 * * *', label: 'Every day at midnight' },
  { value: '0 * * * *', label: 'Every hour' },
  { value: '*/15 * * * *', label: 'Every 15 minutes' },
  { value: '0 2 * * 0', label: 'Every Sunday at 2am' },
  { value: 'custom', label: 'Custom...' },
];
const assignToOptions = [
  { value: 'alice', label: 'Alice Smith' },
  { value: 'bob', label: 'Bob Lee' },
  { value: 'it-team', label: 'IT Support Team' },
];

const defaultTask: Omit<AutomationTask, 'id'> = {
  name: '',
  description: '',
  type: '',
  status: 'pending',
  schedule: '',
  lastRun: '',
  nextRun: '',
  result: '',
  createdBy: 'Current User', // Replace with actual user if available
  target: '',
  priority: '',
  assignedTo: '',
  startDate: '',
  dueDate: '',
  notes: '',
};

const AddAutomationTaskPage: React.FC = () => {
  const { addTask } = useAutomationTasks();
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<AutomationTask, 'id'>>({
    ...defaultTask,
    createdBy: user?.displayName || user?.email || 'Current User',
  });
  const [saving, setSaving] = useState(false);
  const [customSchedule, setCustomSchedule] = useState('');
  const [customType, setCustomType] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await addTask({
      ...form,
      createdBy: getUserName(),
      type: form.type === 'custom' ? customType : form.type,
      schedule: form.schedule === 'custom' ? customSchedule : form.schedule,
    });
    setSaving(false);
    navigate('/automation-tasks');
  };
  const handleCancel = () => {
    navigate('/automation-tasks');
  };

  return (
    <PageWrapper title="Add Automation Task">
      <button
        className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-800 font-medium"
        onClick={handleCancel}
      >
        &larr; Back
      </button>
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Task Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name<span className="text-red-500">*</span></label>
              <input type="text" name="name" className="w-full border border-gray-300 rounded px-3 py-2" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              <select name="type" className="w-full border border-gray-300 rounded px-3 py-2" value={form.type} onChange={handleChange} required>
                <option value="">Select type</option>
                {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              {form.type === 'custom' && (
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
                  placeholder="Enter custom task type"
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" className="w-full border border-gray-300 rounded px-3 py-2" value={form.priority} onChange={handleChange}>
                <option value="">Select priority</option>
                {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <select name="schedule" className="w-full border border-gray-300 rounded px-3 py-2" value={form.schedule} onChange={handleChange} required>
                <option value="">Select schedule</option>
                {scheduleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              {form.schedule === 'custom' && (
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
                  placeholder="Enter custom cron expression"
                  value={customSchedule}
                  onChange={e => setCustomSchedule(e.target.value)}
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" name="startDate" className="w-full border border-gray-300 rounded px-3 py-2" value={form.startDate} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" name="dueDate" className="w-full border border-gray-300 rounded px-3 py-2" value={form.dueDate} onChange={handleChange} />
            </div>
          </div>

          {/* Column 2: Assignment & Target */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select name="assignedTo" className="w-full border border-gray-300 rounded px-3 py-2" value={form.assignedTo} onChange={handleChange}>
                <option value="">Select member/team</option>
                {assignToOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <input type="text" name="target" className="w-full border border-gray-300 rounded px-3 py-2" value={form.target} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
              <input type="text" name="createdBy" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" value={form.createdBy} readOnly />
            </div>
          </div>

          {/* Column 3: Description & Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Description<span className="text-red-500">*</span></label>
              <textarea name="description" className="w-full border border-gray-300 rounded px-3 py-2" value={form.description} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea name="notes" className="w-full border border-gray-300 rounded px-3 py-2" value={form.notes} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button type="button" className="px-6 py-2 rounded bg-gray-200 text-gray-700" onClick={handleCancel}>Cancel</button>
          <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? 'Saving...' : 'Add'}</button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default AddAutomationTaskPage; 