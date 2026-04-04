require('dotenv').config();
const { Pool } = require('pg');

async function seed() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to Supabase...');
        const client = await pool.connect();

        console.log('Inserting Tenant...');
        await client.query(`
      INSERT INTO "Tenant" (id, name, slug, email, "themeColor", "subscriptionPlan", "isActive", "createdAt", "updatedAt")
      VALUES ('00000000-0000-0000-0000-000000000001', 'Yasin Notary Services', 'yasin-notary', 'superadmin@gmail.com', '#6366f1', 'ENTERPRISE', true, now(), now())
      ON CONFLICT (slug) DO NOTHING;
    `);

        console.log('Inserting Super Admin...');
        await client.query(`
      INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isActive", "tenantId", "createdAt", "updatedAt")
      VALUES ('00000000-0000-0000-0000-000000000002', 'superadmin@gmail.com', '$2b$12$ATEFDdFCqLSexNweC4bs8ORRUJwxVbRAZFJ/T4yst6urGOmyQLrGm', 'Yasin', 'Admin', 'SUPER_ADMIN', true, '00000000-0000-0000-0000-000000000001', now(), now())
      ON CONFLICT (email) DO NOTHING;
    `);

        console.log('✅ Seed successful!');
        client.release();
    } catch (err) {
        console.error('❌ Error during direct seed:', err);
        console.error('MESSAGE:', err.message);
        if (err.message && err.message.includes('relation "Tenant"')) {
            console.log('⚠️ TABLES MISSING! You need to push the schema first.');
        }
    } finally {
        await pool.end();
    }
}

seed();
