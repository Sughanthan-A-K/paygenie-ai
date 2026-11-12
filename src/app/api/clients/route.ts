import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch all clients from Neon Postgres
    const clientsRes = await query(`
      SELECT id, name, email, phone, company, preferred_language as "preferredLanguage", 
             avatar_bg as "avatarBg", TO_CHAR(created_at, 'YYYY-MM-DD') as "createdAt"
      FROM clients
      ORDER BY created_at DESC;
    `);

    // 2. Fetch all messages
    const messagesRes = await query(`
      SELECT id, client_id, role, content, timestamp, invoice_draft as "invoiceDraft", is_confirmed as "isConfirmed"
      FROM client_messages
      ORDER BY created_at ASC;
    `);

    // 3. Fetch all invoices
    const invoicesRes = await query(`
      SELECT id, invoice_number as "invoiceNumber", client_name as "clientName", client_email as "clientEmail",
             client_phone as "clientPhone", seller_name as "sellerName", seller_email as "sellerEmail",
             total_amount as "totalAmount", subtotal, discount_percentage as "discountPercentage",
             discount_amount as "discountAmount", tax_percentage as "taxPercentage", tax_amount as "taxAmount",
             currency, status, payment_id as "paymentId", paid_at as "paidAt", date, due_date as "dueDate",
             items, notes, email_draft as "emailDraft"
      FROM invoices
      ORDER BY created_at DESC;
    `);

    // Group messages and invoices by client
    const clients = clientsRes.rows.map((c) => {
      const clientMessages = messagesRes.rows
        .filter((m) => m.client_id === c.id)
        .map(({ client_id, ...m }) => m);

      const clientInvoices = invoicesRes.rows
        .filter((inv) => inv.clientEmail === c.email || inv.clientName === c.name)
        .map((inv) => ({
          ...inv,
          totalAmount: Number(inv.totalAmount),
          subtotal: Number(inv.subtotal),
          discountPercentage: Number(inv.discountPercentage),
          discountAmount: Number(inv.discountAmount),
          taxPercentage: Number(inv.taxPercentage),
          taxAmount: Number(inv.taxAmount),
        }));

      return {
        ...c,
        messages: clientMessages,
        invoices: clientInvoices,
      };
    });

    return NextResponse.json({ ok: true, clients });
  } catch (error: any) {
    console.error('Fetch clients DB error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE_CLIENT') {
      const { client } = body;
      await query(
        `INSERT INTO clients (id, name, email, phone, company, preferred_language, avatar_bg, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE 
         SET name = $2, email = $3, phone = $4, company = $5, preferred_language = $6;`,
        [
          client.id,
          client.name,
          client.email,
          client.phone || null,
          client.company || null,
          client.preferredLanguage || 'English',
          client.avatarBg || 'bg-blue-600',
        ]
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'DELETE_CLIENT') {
      const { clientId } = body;
      await query('DELETE FROM client_messages WHERE client_id = $1;', [clientId]);
      await query('DELETE FROM clients WHERE id = $1;', [clientId]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'BULK_DELETE_CLIENTS') {
      const { clientIds } = body;
      if (Array.isArray(clientIds) && clientIds.length > 0) {
        await query('DELETE FROM client_messages WHERE client_id = ANY($1::varchar[]);', [clientIds]);
        await query('DELETE FROM clients WHERE id = ANY($1::varchar[]);', [clientIds]);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'SAVE_MESSAGE') {
      const { clientId, message } = body;
      await query(
        `INSERT INTO client_messages (id, client_id, role, content, timestamp, invoice_draft, is_confirmed, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW());`,
        [
          message.id,
          clientId,
          message.role,
          message.content,
          message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message.invoiceDraft ? JSON.stringify(message.invoiceDraft) : null,
          Boolean(message.isConfirmed),
        ]
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'CLEAR_CHAT') {
      const { clientId } = body;
      await query('DELETE FROM client_messages WHERE client_id = $1;', [clientId]);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Clients API error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
