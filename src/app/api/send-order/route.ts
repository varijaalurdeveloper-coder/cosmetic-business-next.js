import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
  }

  const body = await req.json();
  const { to, subject, html } = body;

  if (!to || !subject || !html) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, html }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.error || 'Failed to send email' }, { status: response.status });
  }

  return NextResponse.json({ success: true, data });
}
