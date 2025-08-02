const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔄 Migrating database to add radio_id field...\n');

const dbPath = path.join(__dirname, 'radio_registry.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Add radio_id column if it doesn't exist
  db.run(`ALTER TABLE radios ADD COLUMN radio_id TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding radio_id column:', err.message);
    } else {
      console.log('✅ Added radio_id column to radios table');
    }
  });

  // Remove site_code column (SQLite doesn't support DROP COLUMN directly, so we'll just leave it)
  console.log('ℹ️  Note: site_code column still exists but is no longer used');
  
  console.log('\n✅ Migration completed!');
  console.log('You can now use the radio_id field when adding/editing radios.\n');
});

db.close();