import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // 1. Invoices Table
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

    // 2. Clients Table (Dedicated Backend persistence)
    await query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        preferred_language VARCHAR(50) DEFAULT 'English',
        avatar_bg VARCHAR(50) DEFAULT 'bg-blue-600',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Client Messages Table (Chat history per client)
    await query(`
      CREATE TABLE IF NOT EXISTS client_messages (
        id VARCHAR(100) PRIMARY KEY,
        client_id VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        timestamp VARCHAR(50),
        invoice_draft JSONB,
        is_confirmed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    return NextResponse.json({
      ok: true,
      message: 'Verified! Neon PostgreSQL connected: invoices, clients, and client_messages tables ready.',
    });
  } catch (error: any) {
    console.error('Database init error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
