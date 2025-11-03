import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email obbligatoria' },
        { status: 400 }
      );
    }

    // TODO: Integrare con Supabase Auth per reset password
    // Per ora generiamo solo l'email

    const resetToken = crypto.randomUUID();
    
    // Invia email con Resend
    const { data, error } = await resend.emails.send({
      from: 'ALCA LOG <noreply@alcalog.it>',
      to: email,
      subject: 'Reset Password - ALCA LOG',
      html: `
        <h1>Reset Password ALCA LOG</h1>
        <p>Clicca sul link seguente per reimpostare la password:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}">
          Reimposta Password
        </a>
        <p>Questo link scade tra 1 ora.</p>
      `,
    });

    if (error) {
      console.error('Errore invio email:', error);
      return NextResponse.json(
        { error: 'Errore nell\'invio dell\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email di reset inviata',
    });
  } catch (error) {
    console.error('Errore reset password:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

