const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Initialize SQLite database
const dbPath = path.join(__dirname, 'radio_registry.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create radios table with mining-specific fields
  db.run(`CREATE TABLE IF NOT EXISTS radios (
    id TEXT PRIMARY KEY,
    serial_number TEXT UNIQUE NOT NULL,
    radio_id TEXT,
    model TEXT NOT NULL,
    version TEXT,
    user_name TEXT,
    department TEXT,
    location TEXT,
    shift TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    operator_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_ip TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating radios table:', err.message);
    } else {
      console.log('Radios table ready.');
    }
  });

  // Create logs table with operator tracking
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    radio_id TEXT,
    radio_serial TEXT,
    details TEXT,
    operator_name TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating logs table:', err.message);
    } else {
      console.log('Logs table ready.');
    }
  });
}

// Logging function with operator tracking
function logAction(action, radioId, radioSerial, details, operatorName, ipAddress) {
  db.run(
    'INSERT INTO logs (action, radio_id, radio_serial, details, operator_name, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
    [action, radioId, radioSerial, details, operatorName, ipAddress],
    (err) => {
      if (err) {
        console.error('Error logging action:', err.message);
      }
    }
  );
}

// Get client IP address
function getClientIP(req) {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// API Routes

// Get all radios with optional search and filters
app.get('/api/radios', (req, res) => {
  const { search, department, model, user, version, status, shift, limit } = req.query;
  let query = 'SELECT * FROM radios WHERE 1=1';
  let params = [];

  if (search) {
    query += ' AND (serial_number LIKE ? OR radio_id LIKE ? OR model LIKE ? OR user_name LIKE ? OR department LIKE ? OR location LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
  }

  if (department) {
    query += ' AND department LIKE ?';
    params.push(`%${department}%`);
  }

  if (model) {
    query += ' AND model LIKE ?';
    params.push(`%${model}%`);
  }

  if (user) {
    query += ' AND user_name LIKE ?';
    params.push(`%${user}%`);
  }

  if (version) {
    query += ' AND version LIKE ?';
    params.push(`%${version}%`);
  }

  if (status) {
    query += ' AND status LIKE ?';
    params.push(`%${status}%`);
  }

  if (shift) {
    query += ' AND shift LIKE ?';
    params.push(`%${shift}%`);
  }



  query += ' ORDER BY created_at DESC';

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching radios:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

// Get radio by serial number (for duplicate checking)
app.get('/api/radios/serial/:serialNumber', (req, res) => {
  const { serialNumber } = req.params;
  
  db.get('SELECT * FROM radios WHERE serial_number = ?', [serialNumber], (err, row) => {
    if (err) {
      console.error('Error fetching radio by serial:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(row || null);
    }
  });
});

// Add new radio with mining-specific fields
app.post('/api/radios', (req, res) => {
  const { 
    serial_number, radio_id, model, version, user_name, department, location, 
    shift, status, notes, operator_name 
  } = req.body;
  const id = uuidv4();
  const clientIP = getClientIP(req);

  if (!serial_number || !model || !operator_name) {
    return res.status(400).json({ error: 'Serial number, model, and operator name are required' });
  }

  // Check for duplicate
  db.get('SELECT * FROM radios WHERE serial_number = ?', [serial_number], (err, existingRadio) => {
    if (err) {
      console.error('Error checking for duplicate:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (existingRadio) {
      return res.status(409).json({ 
        error: 'Radio with this serial number already exists',
        existingRadio: existingRadio
      });
    }

    // Insert new radio
    db.run(
      `INSERT INTO radios (id, serial_number, radio_id, model, version, user_name, department, location, 
                          shift, status, notes, operator_name, created_by_ip) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, serial_number, radio_id, model, version, user_name, department, location, 
       shift, status || 'active', notes, operator_name, clientIP],
      function(err) {
        if (err) {
          console.error('Error adding radio:', err.message);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          logAction('ADD', id, serial_number, `Added radio: ${model}`, operator_name, clientIP);
          res.status(201).json({ 
            message: 'Radio added successfully', 
            id: id,
            serial_number: serial_number
          });
        }
      }
    );
  });
});

// Update existing radio with mining-specific fields
app.put('/api/radios/:id', (req, res) => {
  const { id } = req.params;
  const { 
    serial_number, radio_id, model, version, user_name, department, location, 
    shift, status, notes, operator_name 
  } = req.body;
  const clientIP = getClientIP(req);

  if (!serial_number || !model || !operator_name) {
    return res.status(400).json({ error: 'Serial number, model, and operator name are required' });
  }

  // Get original radio for logging
  db.get('SELECT * FROM radios WHERE id = ?', [id], (err, originalRadio) => {
    if (err) {
      console.error('Error fetching original radio:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!originalRadio) {
      return res.status(404).json({ error: 'Radio not found' });
    }

    // Update radio
    db.run(
      `UPDATE radios SET serial_number = ?, radio_id = ?, model = ?, version = ?, user_name = ?, 
       department = ?, location = ?, shift = ?, status = ?, 
       notes = ?, operator_name = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [serial_number, radio_id, model, version, user_name, department, location, 
       shift, status, notes, operator_name, id],
      function(err) {
        if (err) {
          console.error('Error updating radio:', err.message);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          const changes = [];
          if (originalRadio.radio_id !== radio_id) changes.push(`radio_id: ${originalRadio.radio_id} → ${radio_id}`);
          if (originalRadio.model !== model) changes.push(`model: ${originalRadio.model} → ${model}`);
          if (originalRadio.version !== version) changes.push(`version: ${originalRadio.version} → ${version}`);
          if (originalRadio.user_name !== user_name) changes.push(`user: ${originalRadio.user_name} → ${user_name}`);
          if (originalRadio.department !== department) changes.push(`department: ${originalRadio.department} → ${department}`);
          if (originalRadio.location !== location) changes.push(`location: ${originalRadio.location} → ${location}`);
          if (originalRadio.shift !== shift) changes.push(`shift: ${originalRadio.shift} → ${shift}`);
          if (originalRadio.status !== status) changes.push(`status: ${originalRadio.status} → ${status}`);
          
          logAction('UPDATE', id, serial_number, `Updated radio: ${changes.join(', ')}`, operator_name, clientIP);
          res.json({ message: 'Radio updated successfully' });
        }
      }
    );
  });
});

// Delete radio with operator tracking
app.delete('/api/radios/:id', (req, res) => {
  const { id } = req.params;
  const { operator_name } = req.body;
  const clientIP = getClientIP(req);

  if (!operator_name) {
    return res.status(400).json({ error: 'Operator name is required for deletion logging' });
  }

  // Get radio info before deletion for logging
  db.get('SELECT * FROM radios WHERE id = ?', [id], (err, radio) => {
    if (err) {
      console.error('Error fetching radio for deletion:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!radio) {
      return res.status(404).json({ error: 'Radio not found' });
    }

    db.run('DELETE FROM radios WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting radio:', err.message);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        logAction('DELETE', id, radio.serial_number, `Deleted radio: ${radio.model}`, operator_name, clientIP);
        res.json({ message: 'Radio deleted successfully' });
      }
    });
  });
});

// Export to Excel
app.get('/api/export', (req, res) => {
  db.all('SELECT * FROM radios ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching radios for export:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Format data for Excel with mining-specific fields
      const exportData = rows.map(row => ({
        'Serial Number': row.serial_number,
        'Radio ID': row.radio_id || '',
        'Model': row.model,
        'Version': row.version || '',
        'Status': row.status || 'Active',
        'Assigned User': row.user_name || '',
        'Department': row.department || '',
        'Shift': row.shift || '',
        'Location': row.location || '',
        'Notes': row.notes || '',
        'Last Updated By': row.operator_name || '',
        'Created Date': moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'),
        'Updated Date': moment(row.updated_at).format('YYYY-MM-DD HH:mm:ss')
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns
      const colWidths = [];
      Object.keys(exportData[0] || {}).forEach(key => {
        const maxLength = Math.max(
          key.length,
          ...exportData.map(row => String(row[key] || '').length)
        );
        colWidths.push({ wch: Math.min(maxLength + 2, 50) });
      });
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Radio Registry');

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for download
      const filename = `radio_registry_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      logAction('EXPORT', null, null, `Exported ${rows.length} radios to Excel`, 'System', getClientIP(req));
      res.send(buffer);
    }
  });
});

// Get activity logs
app.get('/api/logs', (req, res) => {
  const { limit = 100 } = req.query;
  
  db.all(
    'SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?', 
    [parseInt(limit)], 
    (err, rows) => {
      if (err) {
        console.error('Error fetching logs:', err.message);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  // Total radios
  db.get('SELECT COUNT(*) as total FROM radios', [], (err, row) => {
    if (err) {
      console.error('Error getting total count:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    stats.total = row.total;
    
    // Radios by department
    db.all(
      'SELECT department, COUNT(*) as count FROM radios WHERE department IS NOT NULL AND department != "" GROUP BY department ORDER BY count DESC',
      [], 
      (err, deptRows) => {
        if (err) {
          console.error('Error getting department stats:', err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        stats.byDepartment = deptRows;
        
        // Recent activity count
        db.get(
          'SELECT COUNT(*) as recent FROM logs WHERE timestamp >= datetime("now", "-7 days")',
          [],
          (err, recentRow) => {
            if (err) {
              console.error('Error getting recent activity:', err.message);
              return res.status(500).json({ error: 'Internal server error' });
            }
            
            stats.recentActivity = recentRow.recent;
            res.json(stats);
          }
        );
      }
    );
  });
});

// Bulk import radios
app.post('/api/radios/bulk', (req, res) => {
  const { radios, operator_name } = req.body;
  const clientIP = getClientIP(req);

  if (!operator_name) {
    return res.status(400).json({ error: 'Operator name is required for bulk import' });
  }

  if (!radios || !Array.isArray(radios) || radios.length === 0) {
    return res.status(400).json({ error: 'Radios array is required and must not be empty' });
  }

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  const processRadio = (radio, index) => {
    return new Promise((resolve) => {
      const { serial_number, radio_id, model, version, user_name, department, location, shift, status, notes } = radio;
      
      if (!serial_number || !model) {
        errors.push(`Row ${index + 1}: Serial number and model are required`);
        errorCount++;
        resolve();
        return;
      }

      const id = uuidv4();
      
      // Check for duplicate
      db.get('SELECT * FROM radios WHERE serial_number = ?', [serial_number], (err, existingRadio) => {
        if (err) {
          errors.push(`Row ${index + 1}: Database error checking for duplicate`);
          errorCount++;
          resolve();
          return;
        }

        if (existingRadio) {
          errors.push(`Row ${index + 1}: Radio ${serial_number} already exists`);
          errorCount++;
          resolve();
          return;
        }

        // Insert new radio
        db.run(
          `INSERT INTO radios (id, serial_number, radio_id, model, version, user_name, department, location, 
                              shift, status, notes, operator_name, created_by_ip) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, serial_number, radio_id, model, version, user_name, department, location, 
           shift, status || 'active', notes, operator_name, clientIP],
          function(err) {
            if (err) {
              errors.push(`Row ${index + 1}: Error inserting radio ${serial_number}`);
              errorCount++;
            } else {
              logAction('ADD', id, serial_number, `Bulk import: Added radio ${model}`, operator_name, clientIP);
              successCount++;
            }
            resolve();
          }
        );
      });
    });
  };

  // Process all radios
  Promise.all(radios.map(processRadio)).then(() => {
    logAction('BULK_IMPORT', null, null, `Bulk import completed: ${successCount} success, ${errorCount} errors`, operator_name, clientIP);
    
    res.json({
      message: 'Bulk import completed',
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });
  });
});

// Get radio templates
app.get('/api/templates', (req, res) => {
  const templates = [
    {
      id: 'tait-tp9300',
      name: 'Tait TP9300 (Handheld)',
      model: 'Tait TP9300',
      version: 'v3.0',
      status: 'active',
      notes: 'Standard handheld radio for field operations'
    },
    {
      id: 'tait-tm9300',
      name: 'Tait TM9300 (Vehicle Mounted)',
      model: 'Tait TM9300',
      version: 'v3.0',
      status: 'active',
      notes: 'Vehicle-mounted radio for mobile operations'
    }
  ];
  
  res.json(templates);
});

// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});