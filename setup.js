const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up CommLink Pro...');
console.log('');

// Check if client directory exists
const clientDir = path.join(__dirname, 'client');
if (!fs.existsSync(clientDir)) {
  console.log('❌ Error: client directory not found');
  console.log('   This script should be run from the project root');
  process.exit(1);
}

// Check if server dependencies are installed
const nodeModules = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModules)) {
  console.log('❌ Error: Server dependencies not installed');
  console.log('   Run: npm install');
  process.exit(1);
}

// Check if client dependencies are installed
const clientNodeModules = path.join(clientDir, 'node_modules');
if (!fs.existsSync(clientNodeModules)) {
  console.log('❌ Error: Client dependencies not installed');
  console.log('   Run: cd client && npm install');
  process.exit(1);
}

// Check if database exists, create if not
const dbPath = path.join(__dirname, 'radio_registry.db');
if (!fs.existsSync(dbPath)) {
  console.log('✅ Creating database...');
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(dbPath);
  
  // Initialize database tables
  db.serialize(() => {
    // Create radios table with mining-specific fields
    db.run(`CREATE TABLE IF NOT EXISTS radios (
      id TEXT PRIMARY KEY,
      serial_number TEXT UNIQUE NOT NULL,
      model TEXT NOT NULL,
      version TEXT,
      user_name TEXT,
      department TEXT,
      location TEXT,
      site_code TEXT,
      shift TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      operator_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by_ip TEXT
    )`);

    // Create logs table with mining-specific fields
    db.run(`CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      radio_id TEXT,
      radio_serial TEXT,
      details TEXT,
      operator_name TEXT,
      ip_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
  
  db.close();
  console.log('✅ Database created successfully');
} else {
  console.log('✅ Database already exists');
}

console.log('');
console.log('🎉 Setup complete!');
console.log('');
console.log('To start the application:');
console.log('  npm run dev    (start both server and client)');
console.log('  npm start      (start server only)');
console.log('');
console.log('To add demo data:');
console.log('  npm run demo');
console.log('');
console.log('Application will be available at:');
console.log('  Frontend: http://localhost:3000');
console.log('  Backend:  http://localhost:5000');
console.log('');