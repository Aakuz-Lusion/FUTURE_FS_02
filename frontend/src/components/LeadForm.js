import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLead, createLead, updateLead } from '../services/api';

function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    status: 'New',
    source: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await getLead(id);
        const lead = response.data;
        setFormData({
          first_name: lead.first_name || '',
          last_name: lead.last_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          company: lead.company || '',
          position: lead.position || '',
          status: lead.status || 'New',
          source: lead.source || '',
          notes: lead.notes || ''
        });
      } catch (error) {
        console.error('Error fetching lead:', error);
        setError('Failed to load lead data');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('First name, last name, and email are required');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updateLead(id, formData);
      } else {
        await createLead(formData);
      }
      navigate('/leads');
    } catch (error) {
      console.error('Error saving lead:', error);
      setError(error.response?.data?.error || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading lead data...</p>
      </div>
    );
  }

  return (
    <div className="lead-form-container">
      <div className="page-header">
        <h1 className="page-title">
          {isEditing ? 'Edit Lead' : 'Add New Lead'}
        </h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="source">Source</label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Website, Referral, LinkedIn"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Initial Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
                placeholder="Add any initial notes about this lead..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Lead' : 'Create Lead')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/leads')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style jsx="true">{`
        .lead-form-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .lead-form {
          max-width: 100%;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 500;
          color: #555;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input {
          padding: 0.6rem 1rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #4a90d9;
          box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1);
        }

        .form-textarea {
          padding: 0.6rem 1rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #4a90d9;
          box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1);
        }

        .form-actions {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .form-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default LeadForm;