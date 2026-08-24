import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Fallback: process.env für Terminal-Variablen, import.meta.env für .env-Datei
const apiKey = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || import.meta.env.RESEND_FROM_EMAIL;
const toEmail = process.env.RESEND_TO_EMAIL || import.meta.env.RESEND_TO_EMAIL;

if (!apiKey) {
  throw new Error('RESEND_API_KEY nicht gesetzt');
}

const resend = new Resend(apiKey);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, service, message } = await request.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, E-Mail und Nachricht sind erforderlich.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Kontaktanfrage: ${service || 'Allgemein'}`,
      replyTo: email,
      html: `
        <h2>Neue Kontaktanfrage von Valorferrum</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Service:</strong> ${service || 'Nicht angegeben'}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Resend-Fehler:', err);
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};