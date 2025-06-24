import React from 'react';
import { Plus } from 'lucide-react';
import MetricCard from '../Dashboard/MetricCard';
import StatusIndicator from '../Dashboard/StatusIndicator';
import PageWrapper from './PageWrapper';

const TicketsPage = () => {
  const tickets = [
    {
      id: '#TKT-001',
      title: 'Server outage in Production',
      priority: 'critical' as const,
      assignedTo: 'John Doe',
      status: 'In Progress',
      created: '2 hours ago',
    },
    {
      id: '#TKT-002',
      title: 'Slow database performance',
      priority: 'warning' as const,
      assignedTo: 'Sarah Smith',
      status: 'Investigating',
      created: '4 hours ago',
    },
    {
      id: '#TKT-003',
      title: 'User access request',
      priority: 'healthy' as const,
      assignedTo: 'Unassigned',
      status: 'Open',
      created: '1 day ago',
    },
  ];

  return (
    <PageWrapper title="IT Service Tickets">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex flex-col">
            <p className="text-2xl font-semibold text-slate-800">12</p>
            <p className="text-sm text-slate-600">Open Tickets</p>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex flex-col">
            <p className="text-2xl font-semibold text-slate-800">3</p>
            <p className="text-sm text-slate-600">High Priority</p>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex flex-col">
            <p className="text-2xl font-semibold text-slate-800">4.2h</p>
            <p className="text-sm text-slate-600">Avg Response Time</p>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-4">
          <div className="flex flex-col">
            <p className="text-2xl font-semibold text-slate-800">94%</p>
            <p className="text-sm text-slate-600">Resolution Rate</p>
          </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 p-6">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200/30">
          <h3 className="text-lg font-semibold text-black-600">Active Tickets</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 backdrop-blur-sm">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/30">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-black-400">{ticket.id}</td>
                  <td className="px-4 py-3 text-sm text-black-400">{ticket.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                      ticket.priority === 'critical'
                        ? 'bg-red-100/80 text-red-800'
                        : ticket.priority === 'warning'
                        ? 'bg-yellow-100/80 text-yellow-800'
                        : 'bg-green-100/80 text-green-800'
                    }`}>
                      {ticket.priority === 'critical' ? 'High' : 
                       ticket.priority === 'warning' ? 'Medium' : 'Low'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-black-400">{ticket.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/80 text-blue-800 backdrop-blur-sm">
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-black-400">{ticket.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TicketsPage;