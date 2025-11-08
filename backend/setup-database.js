const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL (without specifying database first)
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
    });

    console.log('Connected to MySQL server');

  
    const database = process.env.MYSQL_DATABASE || 'kiddovents';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
    console.log(`Database '${database}' ready`);

   
    await connection.query(`USE ${database}`);

    const sqlFile = path.join(__dirname, 'database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

  
    const cleanedSql = sql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .trim();

 
    const statements = cleanedSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          await connection.query(statement);
          console.log(`  ✓ Statement ${i + 1} executed`);
        } catch (err) {
          // Ignore errors for tables/columns that already exist
          if (err.code === 'ER_DUP_FIELDNAME' || 
              err.code === 'ER_DUP_KEYNAME' || 
              err.code === 'ER_TABLE_EXISTS_ERROR' ||
              err.code === 'ER_DUP_ENTRY') {
            console.log(`  ⚠ Skipped (already exists): ${err.message.split('\n')[0]}`);
          } else {
            console.error(`  ❌ Error in statement ${i + 1}:`, err.message);
            throw err;
          }
        }
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log('✅ Packages have been inserted into the database.');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

setupDatabase();

