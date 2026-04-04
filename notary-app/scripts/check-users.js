require('dotenv').config({ path: '.env' });

const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    connectionString: process.env.DIRECT_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected to database!');
    
    const result = await client.query(
      'SELECT email, role, "isActive" FROM "User" LIMIT 10'
    );
    
    console.log('Users found:', result.rows.length);
    result.rows.forEach(u => {
      console.log(` - ${u.email} | ${u.role} | active: ${u.isActive}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkUsers();
