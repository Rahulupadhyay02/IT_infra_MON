import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../config/firebase';

// Add a type for ticket comments
interface TicketComment {
  text: string;
  status: string;
  author: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  creatorUid: string;
  comment?: string;
  comments?: TicketComment[];
}

const IT_TicketPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [comment, setComment] = useState<{ [id: string]: string }>({});
  const [newStatus, setNewStatus] = useState<{ [id: string]: string }>({});

  // Only allow helpdesk user
  const isHelpdesk = user && user.email === 'ithelpdesk@rr.com.in';

  useEffect(() => {
    if (!isHelpdesk) return;
    setTicketsLoading(true);
    const ticketsRef = ref(database, 'tickets');
    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      const value = snapshot.val();
      const arr: Ticket[] = value
        ? Object.entries(value).map(([id, ticket]: [string, any]) => ({ id, ...ticket }))
        : [];
      setTickets(arr);
      setTicketsLoading(false);
      console.log('IT_TicketPage: tickets snapshot', value);
    });
    return () => unsubscribe();
  }, [isHelpdesk]);

  const handleUpdate = async (ticket: Ticket) => {
    setStatusUpdating(ticket.id);
    try {
      const ticketRef = ref(database, `tickets/${ticket.id}`);
      const newComment: TicketComment = {
        text: comment[ticket.id] || '',
        status: newStatus[ticket.id] || ticket.status,
        author: user?.email || 'IT Helpdesk',
        createdAt: new Date().toISOString(),
      };
      // Append to comments array
      const updatedComments = Array.isArray(ticket.comments) ? [...ticket.comments, newComment] : [newComment];
      await update(ticketRef, {
        status: newStatus[ticket.id] || ticket.status,
        comment: comment[ticket.id] || '',
        comments: updatedComments,
        updatedAt: new Date().toISOString(),
      });
      setComment((prev) => ({ ...prev, [ticket.id]: '' }));
    } finally {
      setStatusUpdating(null);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!isHelpdesk) {
    return <div className="text-center text-red-600">Access denied. Only IT helpdesk can view this page.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 bg-white/90 rounded-lg shadow-lg p-8 border border-blue-100">
      <h2 className="text-xl font-bold mb-4 text-blue-900">All Tickets (IT Helpdesk)</h2>
      {ticketsLoading ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center text-gray-500">No tickets found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="text-lg font-bold text-blue-900">{ticket.title}</div>
                <div className="whitespace-pre-line break-words bg-white rounded p-2 border border-slate-200 text-slate-800">
                  {ticket.description}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 items-center mt-2">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Status:</span>
                  <select
                    value={newStatus[ticket.id] || ticket.status}
                    onChange={e => setNewStatus(s => ({ ...s, [ticket.id]: e.target.value }))}
                    className="ml-2 border rounded px-2 py-1"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[120px] max-w-xs w-full">
                  <span className="text-xs font-semibold text-gray-500">Comment:</span>
                  <textarea
                    className="ml-2 border rounded px-2 py-1 w-full min-h-[56px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Add comment"
                    value={comment[ticket.id] || ''}
                    onChange={e => setComment(c => ({ ...c, [ticket.id]: e.target.value }))}
                    rows={3}
                  />
                </div>
                <button
                  onClick={() => handleUpdate(ticket)}
                  disabled={statusUpdating === ticket.id}
                  className="ml-auto px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 border border-blue-200"
                >
                  {statusUpdating === ticket.id ? 'Updating...' : 'Submit'}
                </button>
              </div>
              {/* Comment history */}
              {Array.isArray(ticket.comments) && ticket.comments.length > 0 && (
                <div className="mt-3 bg-slate-100 rounded p-2 border border-slate-200">
                  <div className="font-semibold text-xs text-slate-700 mb-1">Comment History:</div>
                  <ul className="space-y-1">
                    {ticket.comments.map((c, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <span className="font-semibold">{c.author}</span>
                        <span className="text-slate-500">[{c.status}]</span>
                        <span className="">{c.text}</span>
                        <span className="text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-2">
                <div><span className="font-semibold">Created By:</span> {ticket.creatorUid}</div>
                <div><span className="font-semibold">Created At:</span> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}</div>
                <div><span className="font-semibold">Last Updated:</span> {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IT_TicketPage; 