import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ref, push, onValue, update } from 'firebase/database';
import { database } from '../../config/firebase';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  creatorUid: string;
  comments?: {
    author: string;
    status: string;
    text: string;
    createdAt: string;
  }[];
}

const TicketPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setTicketsLoading(true);
    const ticketsRef = ref(database, 'tickets');
    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      const value = snapshot.val();
      console.log('Tickets snapshot:', value);
      const arr: Ticket[] = value
        ? Object.entries(value)
            .map(([id, ticket]: [string, any]) => ({ id, ...ticket }))
            .filter((t) => t.creatorUid === user.uid)
        : [];
      setTickets(arr);
      console.log('Tickets array:', arr);
      setTicketsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      if (!user) throw new Error('Not authenticated');
      const ticketsRef = ref(database, 'tickets');
      await push(ticketsRef, {
        title,
        description,
        status: 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: user.uid,
      });
      setTitle('');
      setDescription('');
      setFeedback('Ticket submitted successfully!');
    } catch (err) {
      console.error('Ticket submission error:', err);
      setFeedback('Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (ticket: Ticket) => {
    setEditingId(ticket.id);
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      const ticketRef = ref(database, `tickets/${editingId}`);
      await update(ticketRef, {
        title: editTitle,
        description: editDescription,
        updatedAt: new Date().toISOString(),
      });
      setEditingId(null);
      setEditTitle('');
      setEditDescription('');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (!user) {
    return <div className="text-center text-red-600">Please sign in to raise and track tickets.</div>;
  }
  if (user.email === 'ithelpdesk@rr.com.in') {
    return <div className="text-center text-red-600">Access denied. IT helpdesk should use the IT Ticket page.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white/90 rounded-lg shadow-lg p-8 border border-blue-100">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Raise a New Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="w-full border border-gray-300 rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
        {feedback && <div className="text-green-600 mt-2">{feedback}</div>}
      </form>
      <h3 className="text-lg font-semibold mb-4 text-blue-900">Your Tickets</h3>
      {tickets.length === 0 ? (
        <div className="text-center text-gray-500">No tickets found.</div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-slate-50/80 rounded-lg p-4 border border-gray-200">
              {editingId === ticket.id ? (
                <form onSubmit={handleEditSubmit} className="space-y-2">
                  <input type="text" className="w-full border rounded px-2 py-1" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
                  <textarea className="w-full border rounded px-2 py-1" value={editDescription} onChange={e => setEditDescription(e.target.value)} required />
                  <div className="flex gap-2">
                    <button type="submit" disabled={editSubmitting} className="px-3 py-1 bg-green-600 text-white rounded">
                      {editSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-800">{ticket.title}</div>
                      <div className="text-sm text-slate-600 mt-1">{ticket.description}</div>
                    </div>
                    <button className="text-blue-600 hover:underline" onClick={() => startEdit(ticket)}>
                      Edit
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 mt-2">Status: <span className="font-semibold">{ticket.status}</span></div>
                  <div className="text-xs text-slate-500">Last updated: {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—'}</div>
                  {/* IT Helpdesk comment history */}
                  {Array.isArray(ticket.comments) && ticket.comments.length > 0 && (
                    <div className="mt-3 bg-slate-100 rounded p-2 border border-slate-200">
                      <div className="font-semibold text-xs text-slate-700 mb-1">IT Helpdesk Replies:</div>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketPage; 