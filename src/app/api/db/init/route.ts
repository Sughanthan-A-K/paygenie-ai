import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // 1. Create Invoices Table
    await query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(100) PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50),
        seller_name VARCHAR(255) NOT NULL,
        seller_email VARCHAR(255),
        total_amount NUMERIC(12,2) NOT NULL,
        subtotal NUMERIC(12,2) NOT NULL,
        discount_percentage NUMERIC(5,2) DEFAULT 0,
        discount_amount NUMERIC(12,2) DEFAULT 0,
        tax_percentage NUMERIC(5,2) DEFAULT 0,
        tax_amount NUMERIC(12,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'PENDING',
        payment_id VARCHAR(100),
        paid_at VARCHAR(100),
        date VARCHAR(20) NOT NULL,
        due_date VARCHAR(20) NOT NULL,
        items JSONB NOT NULL,
        notes TEXT,
        email_draft JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Query count to prove live execution
    const res = await query('SELECT count(*) FROM invoices;');
    const count = res.rows[0]?.count || 0;

    return NextResponse.json({
      ok: true,
      message: 'Verified! Neon PostgreSQL connected and table created successfully.',
      invoiceCount: count,
    });
  } catch (error: any) {
    console.error('Database init error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
