const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_03iIlRrXpVUe@ep-orange-band-bbm0ytsr-pooler.c-15.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function seed() {
  try {
    await pool.query('DELETE FROM client_messages;');
    await pool.query('DELETE FROM invoices;');
    await pool.query('DELETE FROM clients;');

    const clientId = 'client-acme-sample';
    await pool.query(
      `INSERT INTO clients (id, name, email, phone, company, preferred_language, avatar_bg, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [clientId, 'Acme Innovations', 'billing@acme.io', '+1 (555) 234-5678', 'Acme Corp', 'English', 'bg-[#003087]']
    );

    console.log('Successfully seeded 1 clean sample client (Acme Innovations) into Neon DB with 0 messages!');
  } catch (err) {
    console.error('Error seeding sample client:', err);
  } finally {
    await pool.end();
  }
}

seed();
