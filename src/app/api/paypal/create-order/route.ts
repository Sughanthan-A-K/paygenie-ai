import { NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get PayPal access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { amount, currency = 'USD', invoiceNumber, clientName } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: invoiceNumber || `INV-${Date.now()}`,
          description: `Invoice ${invoiceNumber || ''} payment for ${clientName || 'Services'}`,
          amount: {
            currency_code: currency,
            value: Number(amount).toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'PayGenie AI',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: 'https://example.com/return',
        cancel_url: 'https://example.com/cancel',
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Order creation failed' }, { status: response.status });
    }

    return NextResponse.json({ orderId: data.id, order: data });
  } catch (error: any) {
    console.error('PayPal Order Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
