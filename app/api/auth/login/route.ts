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

    // Verifica che l'URL di Supabase sia valido
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
      console.error('URL Supabase non valido:', supabaseUrl);
      return NextResponse.json(
        { error: 'Configurazione Supabase non valida' },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Errore Supabase auth:', {
          message: error.message,
          status: error.status,
          name: error.name,
          url: supabaseUrl,
        });
        
        // Gestione specifica per "fetch failed" - problema di connettività
        if (error.message?.includes('fetch failed') || 
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('NetworkError') ||
            error.message?.includes('Network request failed')) {
          console.error('Errore di rete Supabase:', {
            url: supabaseUrl,
            error: error.message,
          });
          return NextResponse.json(
            { 
              error: 'Errore di connessione al server di autenticazione. Verifica la configurazione e la connettività.',
              details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 503 }
          );
        }
        
        // Altri errori di autenticazione
        return NextResponse.json(
          { error: error.message || 'Credenziali non valide' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        user: data.user,
        session: data.session,
      });
    } catch (err) {
      console.error('Errore durante login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      return NextResponse.json(
        { 
          error: 'Errore interno durante l\'autenticazione',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
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

