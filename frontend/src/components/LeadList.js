import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLeads, deleteLead } from '../services/api';

function LeadList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      
      const response = await getLeads(params);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteLead(id);
      setSuccess('Lead deleted successfully');
      fetchLeads();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting lead:', error);
      setError('Failed to delete lead');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Leads</h1>
        <Link to="/leads/new" className="btn btn-primary">+ Add New Lead</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Closed">Closed</option>
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setSearch('');
                setFilterStatus('');
                fetchLeads();
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {leads.length === 0 ? (
          <div className="no-leads">
            <p>No leads found. Start adding leads!</p>
            <Link to="/leads/new" className="btn btn-primary">Add First Lead</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <Link to={`/leads/${lead.id}`} className="lead-name-link">
                        {lead.first_name} {lead.last_name}
                      </Link>
                    </td>
                    <td>{lead.email}</td>
                    <td>{lead.company || '-'}</td>
                    <td>
                      <span className={getStatusClass(lead.status)}>
                        {lead.status}
                      </span>
                    </td>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/leads/${lead.id}/edit`} 
                          className="btn btn-warning btn-sm"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(lead.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .search-form {
          margin-bottom: 1.5rem;
        }

        .search-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 0.6rem 1rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #4a90d9;
          box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1);
        }

        .filter-select {
          padding: 0.6rem 1rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          background: white;
          min-width: 140px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #4a90d9;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .leads-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leads-table thead {
          background: #f8f9fa;
        }

        .leads-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #dee2e6;
        }

        .leads-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .leads-table tbody tr:hover {
          background: #f8f9fa;
        }

        .lead-name-link {
          color: #2c3e50;
          text-decoration: none;
          font-weight: 500;
        }

        .lead-name-link:hover {
          color: #4a90d9;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .no-leads {
          text-align: center;
          padding: 3rem 0;
        }

        .no-leads p {
          color: #7f8c8d;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .search-row {
            flex-direction: column;
          }
          
          .search-input,
          .filter-select {
            width: 100%;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default LeadList;