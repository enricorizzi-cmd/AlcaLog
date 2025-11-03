import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verifica variabili d'ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Variabili Supabase mancanti:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });
      return NextResponse.json(
        { error: 'Configurazione server non valida' },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatorie' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Errore Supabase auth:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      // Gestione specifica per "fetch failed" - probabilmente variabili d'ambiente non configurate
      if (error.message?.includes('fetch failed') || error.message?.includes('Failed to fetch')) {
        return NextResponse.json(
          { error: 'Errore di connessione al server di autenticazione. Verifica la configurazione.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Credenziali non valide' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Errore login:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

