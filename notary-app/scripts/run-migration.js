require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to Postgres to run migration...');
        const client = await pool.connect();
        
        const sqlPath = path.join(__dirname, '..', 'migration_utf8.sql');
        const fileContent = fs.readFileSync(sqlPath, 'utf8');
        const sqlStart = fileContent.indexOf('-- CreateSchema');
        
        if (sqlStart === -1) {
            throw new Error('Could not find -- CreateSchema in file');
        }
        
        const sql = fileContent.substring(sqlStart);
        
        console.log('Running SQL...');
        await client.query(sql);
        console.log('✅ Migration successful!');
        
        client.release();
    } catch (err) {
        console.error('❌ Error during migration:', err);
    } finally {
        await pool.end();
    }
}

migrate();
