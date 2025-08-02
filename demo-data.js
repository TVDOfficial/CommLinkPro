#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

console.log('📻 Adding demo data to Radio Registry...\n');

// Demo radio data with mining-specific fields
const demoRadios = [
  {
    serial_number: 'TP001',
    radio_id: '12345',
    model: 'Tait TP9300',
    version: 'v3.0',
    user_name: 'John Smith',
    department: 'Security',
    location: 'Main Gate',
    shift: 'Day Shift',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Handheld radio for security operations'
  },
  {
    serial_number: 'MTR002',
    model: 'Motorola CP200',
    version: 'v2.1',
    user_name: 'Sarah Johnson',
    department: 'Security',
    location: 'North Patrol',
    site_code: 'MINE-A',
    shift: 'Night Shift',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Backup radio for north perimeter'
  },
  {
    serial_number: 'KWD001',
    model: 'Kenwood TK-3402',
    version: 'R01.00.00',
    user_name: 'Mike Wilson',
    department: 'Maintenance',
    location: 'Workshop',
    site_code: 'MINE-A',
    shift: 'Day Shift',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Workshop communication radio'
  },
  {
    serial_number: 'KWD002',
    model: 'Kenwood TK-3402',
    version: 'R01.00.00',
    user_name: 'Lisa Chen',
    department: 'Maintenance',
    location: 'Building B',
    site_code: 'MINE-A',
    shift: 'Swing Shift',
    status: 'maintenance',
    operator_name: 'Demo System',
    notes: 'Maintenance rounds radio - currently in for service'
  },
  {
    serial_number: 'HYT001',
    model: 'Hytera PD405',
    version: 'v1.3',
    user_name: 'David Brown',
    department: 'Operations',
    location: 'Control Room',
    site_code: 'MINE-A',
    shift: 'Day Shift',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Control room communications'
  },
  {
    serial_number: 'HYT002',
    model: 'Hytera PD405',
    version: 'v1.3',
    user_name: '',
    department: 'Operations',
    location: 'Spare Equipment',
    site_code: 'MINE-A',
    shift: '',
    status: 'reserved',
    operator_name: 'Demo System',
    notes: 'Backup radio - unassigned'
  },
  {
    serial_number: 'MTR003',
    model: 'Motorola XPR3300',
    version: 'v3.0',
    user_name: 'Amanda Davis',
    department: 'Administration',
    location: 'Office Complex',
    site_code: 'MINE-A',
    shift: 'Day Shift',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Management communication radio'
  },
  {
    serial_number: 'ICM001',
    model: 'Icom IC-F4029SDR',
    version: 'v2.5',
    user_name: 'Robert Taylor',
    department: 'Emergency Response',
    location: 'Fire Safety Station',
    site_code: 'MINE-A',
    shift: 'On-Call',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Emergency response coordination'
  },
  {
    serial_number: 'ICM002',
    model: 'Icom IC-F4029SDR',
    version: 'v2.5',
    user_name: 'Jennifer White',
    department: 'Emergency Response',
    location: 'Medical Station',
    site_code: 'MINE-A',
    shift: 'On-Call',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Medical emergency communications'
  },
  {
    serial_number: 'VTX001',
    model: 'Vertex VX-261',
    version: 'v1.8',
    user_name: 'Tom Anderson',
    department: 'Logistics',
    location: 'Warehouse',
    site_code: 'MINE-B',
    shift: 'Day Shift',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Warehouse operations radio'
  },
  {
    serial_number: 'PIT001',
    model: 'Motorola XPR7350',
    version: 'v4.2',
    user_name: 'Carlos Rodriguez',
    department: 'Operations',
    location: 'Pit Floor',
    site_code: 'PIT-01',
    shift: 'Day Shift',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Heavy equipment operator radio'
  },
  {
    serial_number: 'ENV001',
    model: 'Kenwood NX-3320',
    version: 'v2.8',
    user_name: 'Dr. Maria Santos',
    department: 'Environmental',
    location: 'Field Station',
    site_code: 'MINE-A',
    shift: 'Day Shift',
    status: 'active',
    operator_name: 'Demo System',
    notes: 'Environmental monitoring radio'
  }
];

// Database connection
const dbPath = path.join(__dirname, 'radio_registry.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Function to add demo data
async function addDemoData() {
  try {
    // Check if radios table exists and has data
    const existingCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM radios', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });

    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} radio(s)`);
      console.log('   Demo data will be added alongside existing data.');
    }

    console.log(`📝 Adding ${demoRadios.length} demo radios...\n`);

    // Insert demo radios
    for (let i = 0; i < demoRadios.length; i++) {
      const radio = demoRadios[i];
      const id = uuidv4();
      
      await new Promise((resolve, reject) => {
        db.run(
                `INSERT INTO radios (id, serial_number, radio_id, model, version, user_name, department, location, 
                          shift, status, notes, operator_name, created_by_ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, radio.serial_number, radio.radio_id, radio.model, radio.version, radio.user_name, 
       radio.department, radio.location, radio.shift, 
           radio.status, radio.notes, radio.operator_name, '127.0.0.1'],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                console.log(`⚠️  Radio ${radio.serial_number} already exists, skipping...`);
                resolve();
              } else {
                reject(err);
              }
            } else {
              console.log(`✅ Added radio: ${radio.serial_number} (${radio.model})`);
              resolve();
            }
          }
        );
      });

      // Add log entry
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO logs (action, radio_id, radio_serial, details, operator_name, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
          ['ADD', id, radio.serial_number, `Demo data: Added ${radio.model}`, 'Demo System', '127.0.0.1'],
          (err) => {
            if (err) {
              console.log(`⚠️  Could not log entry for ${radio.serial_number}`);
            }
            resolve();
          }
        );
      });
    }

    // Get final count
    const finalCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM radios', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });

    console.log(`\n🎉 Demo data setup complete!`);
    console.log(`📊 Total radios in database: ${finalCount}`);
    console.log(`\n🚀 You can now start the application:`);
    console.log(`   • Development: npm run dev`);
    console.log(`   • Production:  npm start`);
    console.log(`   • Access:      http://localhost:3000`);

  } catch (error) {
    console.error('\n❌ Error adding demo data:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Check if database file exists
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.log('⚠️  Database file not found. Starting the server first will create it.');
  console.log('   Run "npm start" or "npm run dev" first to initialize the database.');
  process.exit(1);
}

// Run the demo data setup
addDemoData();