import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Usa client Supabase diretto con configurazione per retry e timeout
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          fetch: (url, options = {}) => {
            // Timeout manuale per compatibilità
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));
          },
        },
      }
    );

    // Retry mechanism per connessioni instabili
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          lastError = error;
          // Se non è un errore di rete, non riprovare
          if (!error.message?.includes('fetch failed') && 
              !error.message?.includes('Failed to fetch') &&
              !error.message?.includes('NetworkError')) {
            break;
          }
          // Se è un errore di rete e non è l'ultimo tentativo, aspetta e riprova
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
        } else {
          // Successo!
          return NextResponse.json({
            user: data.user,
            session: data.session,
          });
        }
      } catch (err) {
        lastError = err;
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      }
    }

    // Se arriviamo qui, tutti i tentativi sono falliti
    const error = lastError;

    // Gestione errori dopo tutti i tentativi
    if (error) {
      console.error('Errore Supabase auth dopo retry:', {
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
  } catch (error) {
    console.error('Errore login:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

