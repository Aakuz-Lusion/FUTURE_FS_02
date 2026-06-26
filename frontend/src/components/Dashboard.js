import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLeads } from '../services/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  // const [leads, setLeads] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    newThisMonth: 0,
    recentLeads: []
  });

  useEffect(() => {
  if (!id) return;

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

  fetchLead();
}, [id]);

  const fetchLeads = async () => {
    try {
      const response = await getLeads();
      const data = response.data;
      // setLeads(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leadsData) => {
    const byStatus = {};
    let newThisMonth = 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    leadsData.forEach(lead => {
      // Count by status
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;

      // Count new this month
      const createdDate = new Date(lead.created_at);
      if (createdDate >= monthStart) {
        newThisMonth++;
      }
    });

    // Get 5 most recent leads
    const recentLeads = [...leadsData]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    setStats({
      total: leadsData.length,
      byStatus,
      newThisMonth,
      recentLeads
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Chart data
  const statusColors = {
    'New': '#2980b9',
    'Contacted': '#f39c12',
    'Qualified': '#27ae60',
    'Proposal': '#8e44ad',
    'Closed': '#e74c3c'
  };

  const chartData = {
    labels: Object.keys(stats.byStatus),
    datasets: [
      {
        data: Object.values(stats.byStatus),
        backgroundColor: Object.keys(stats.byStatus).map(status => statusColors[status] || '#95a5a6'),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <Link to="/leads/new" className="btn btn-primary">+ Add New Lead</Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Leads</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.newThisMonth}</div>
            <div className="stat-label">New This Month</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{Object.keys(stats.byStatus).length}</div>
            <div className="stat-label">Active Statuses</div>
          </div>
        </div>
      </div>

      {/* Chart and Recent Leads */}
      <div className="dashboard-grid">
        <div className="card chart-card">
          <h3 className="card-title">Lead Distribution by Status</h3>
          {Object.keys(stats.byStatus).length > 0 ? (
            <div className="chart-wrapper">
              <Pie data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p className="no-data">No leads yet. Start adding leads!</p>
          )}
        </div>

        <div className="card recent-leads-card">
          <h3 className="card-title">Recent Leads</h3>
          {stats.recentLeads.length > 0 ? (
            <div className="recent-leads-list">
              {stats.recentLeads.map(lead => (
                <Link to={`/leads/${lead.id}`} key={lead.id} className="recent-lead-item">
                  <div className="recent-lead-info">
                    <span className="recent-lead-name">{lead.first_name} {lead.last_name}</span>
                    <span className="recent-lead-company">{lead.company || 'No company'}</span>
                  </div>
                  <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent leads</p>
          )}
          <Link to="/leads" className="view-all-link">View All Leads →</Link>
        </div>
      </div>

      <style jsx="true">{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stat-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .stat-label {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .chart-card {
          min-height: 300px;
        }

        .chart-wrapper {
          height: 250px;
        }

        .recent-leads-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .recent-lead-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.2s;
        }

        .recent-lead-item:hover {
          background: #e9ecef;
        }

        .recent-lead-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .recent-lead-company {
          font-size: 0.85rem;
          color: #7f8c8d;
          display: block;
        }

        .view-all-link {
          display: inline-block;
          margin-top: 1rem;
          color: #4a90d9;
          text-decoration: none;
          font-weight: 500;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .no-data {
          color: #95a5a6;
          text-align: center;
          padding: 2rem 0;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;