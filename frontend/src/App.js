import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import LeadDetails from './components/LeadDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container nav-container">
            <Link to="/" className="nav-brand">
              <span className="brand-icon">📊</span>
              Mini CRM
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/leads" className="nav-link">Leads</Link>
              <Link to="/leads/new" className="nav-link nav-link-primary">+ New Lead</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadList />} />
              <Route path="/leads/new" element={<LeadForm />} />
              <Route path="/leads/:id" element={<LeadDetails />} />
              <Route path="/leads/:id/edit" element={<LeadForm />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;