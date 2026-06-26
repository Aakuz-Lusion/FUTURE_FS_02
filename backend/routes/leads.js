const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all leads with search and filter
router.get('/', (req, res) => {
  const { search, status } = req.query;
  let query = `
    SELECT 
      l.*,
      COUNT(n.id) as notes_count,
      GROUP_CONCAT(n.note, '|||') as notes_list
    FROM leads l
    LEFT JOIN lead_notes n ON l.id = n.lead_id
  `;
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push(`(l.first_name LIKE ? OR l.last_name LIKE ? OR l.email LIKE ? OR l.company LIKE ?)`);
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  if (status) {
    conditions.push(`l.status = ?`);
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` GROUP BY l.id ORDER BY l.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching leads:', err);
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
    
    const leads = rows.map(row => {
      const notes = row.notes_list ? row.notes_list.split('|||').filter(n => n) : [];
      return {
        ...row,
        notes,
        full_name: `${row.first_name} ${row.last_name}`
      };
    });
    
    res.json(leads);
  });
});

// Get single lead
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      l.*,
      GROUP_CONCAT(n.note, '|||') as notes_list
    FROM leads l
    LEFT JOIN lead_notes n ON l.id = n.lead_id
    WHERE l.id = ?
    GROUP BY l.id
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching lead:', err);
      return res.status(500).json({ error: 'Failed to fetch lead' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const notes = row.notes_list ? row.notes_list.split('|||').filter(n => n) : [];
    const lead = {
      ...row,
      notes,
      full_name: `${row.first_name} ${row.last_name}`
    };
    
    res.json(lead);
  });
});

// Create new lead
router.post('/', (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    company,
    position,
    status = 'New',
    source,
    notes
  } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }

  const query = `
    INSERT INTO leads (first_name, last_name, email, phone, company, position, status, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [first_name, last_name, email, phone, company, position, status, source], function(err) {
    if (err) {
      console.error('Error creating lead:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to create lead' });
    }

    const leadId = this.lastID;

    if (notes) {
      const noteQuery = `INSERT INTO lead_notes (lead_id, note) VALUES (?, ?)`;
      db.run(noteQuery, [leadId, notes]);
    }

    res.status(201).json({
      id: leadId,
      message: 'Lead created successfully'
    });
  });
});

// Update lead
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    company,
    position,
    status,
    source
  } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }

  const query = `
    UPDATE leads 
    SET 
      first_name = ?,
      last_name = ?,
      email = ?,
      phone = ?,
      company = ?,
      position = ?,
      status = ?,
      source = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [first_name, last_name, email, phone, company, position, status, source, id], function(err) {
    if (err) {
      console.error('Error updating lead:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to update lead' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead updated successfully' });
  });
});

// Delete lead
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM leads WHERE id = ?`;

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting lead:', err);
      return res.status(500).json({ error: 'Failed to delete lead' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  });
});

// Add note to lead
router.post('/:id/notes', (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note) {
    return res.status(400).json({ error: 'Note is required' });
  }

  db.get('SELECT id FROM leads WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error checking lead:', err);
      return res.status(500).json({ error: 'Failed to add note' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const query = `INSERT INTO lead_notes (lead_id, note) VALUES (?, ?)`;
    db.run(query, [id, note], function(err) {
      if (err) {
        console.error('Error adding note:', err);
        return res.status(500).json({ error: 'Failed to add note' });
      }

      res.status(201).json({
        id: this.lastID,
        note,
        created_at: new Date().toISOString()
      });
    });
  });
});

module.exports = router;