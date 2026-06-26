import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLead, deleteLead, addNote } from '../services/api';

function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id ,fetchLead]);

  const fetchLead = async () => {
    try {
      const response = await getLead(id);
      setLead(response.data);
    } catch (error) {
      console.error('Error fetching lead:', error);
      setError('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteLead(id);
      navigate('/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
      setError('Failed to delete lead');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmitting(true);
      await addNote(id, newNote);
      setNewNote('');
      await fetchLead(); // Refresh lead data
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading lead details...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="card">
        <div className="alert alert-error">{error || 'Lead not found'}</div>
        <Link to="/leads" className="btn btn-secondary">Back to Leads</Link>
      </div>
    );
  }

  return (
    <div className="lead-details-container">
      <div className="page-header">
        <div>
          <Link to="/leads" className="back-link">← Back to Leads</Link>
          <h1 className="page-title">{lead.first_name} {lead.last_name}</h1>
        </div>
        <div className="header-actions">
          <Link to={`/leads/${id}/edit`} className="btn btn-warning">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      </div>

      <div className="details-grid">
        <div className="card details-card">
          <h3 className="card-title">Contact Information</h3>
          <div className="details-list">
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{lead.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{lead.phone || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Company</span>
              <span className="detail-value">{lead.company || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Position</span>
              <span className="detail-value">{lead.position || '-'}</span>
            </div>
          </div>
        </div>

        <div className="card details-card">
          <h3 className="card-title">Lead Information</h3>
          <div className="details-list">
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className={getStatusClass(lead.status)}>{lead.status}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Source</span>
              <span className="detail-value">{lead.source || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {new Date(lead.created_at).toLocaleString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">
                {new Date(lead.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card notes-card">
        <h3 className="card-title">Notes</h3>
        <form onSubmit={handleAddNote} className="add-note-form">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this lead..."
            className="note-input"
            rows="3"
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting || !newNote.trim()}
          >
            {submitting ? 'Adding...' : 'Add Note'}
          </button>
        </form>

        {lead.notes && lead.notes.length > 0 ? (
          <div className="notes-list">
            {lead.notes.map((note, index) => (
              <div key={index} className="note-item">
                <p className="note-text">{note}</p>
                <span className="note-date">
                  Added on {new Date().toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-notes">No notes yet for this lead.</p>
        )}
      </div>

      <style jsx="true">{`
        .lead-details-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-link {
          color: #4a90d9;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .details-card .card-title {
          margin-bottom: 1rem;
        }

        .details-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f2f5;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #7f8c8d;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .detail-value {
          color: #2c3e50;
          font-weight: 500;
        }

        .notes-card .card-title {
          margin-bottom: 1rem;
        }

        .add-note-form {
          margin-bottom: 1.5rem;
        }

        .note-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          resize: vertical;
          font-family: inherit;
          margin-bottom: 0.75rem;
        }

        .note-input:focus {
          outline: none;
          border-color: #4a90d9;
          box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1);
        }

        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .note-item {
          background: #f8f9fa;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          border-left: 3px solid #4a90d9;
        }

        .note-text {
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }

        .note-date {
          color: #95a5a6;
          font-size: 0.8rem;
        }

        .no-notes {
          color: #95a5a6;
          text-align: center;
          padding: 1rem 0;
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            margin-top: 1rem;
            width: 100%;
          }
          
          .header-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default LeadDetails;