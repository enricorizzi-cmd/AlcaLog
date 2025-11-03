import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Verifica variabili d'ambiente e pulisci da spazi/caratteri nascosti
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
      console.error('Variabili Supabase mancanti:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlLength: supabaseUrl?.length,
        keyLength: supabaseKey?.length,
      });
      return NextResponse.json(
        { error: 'Configurazione server non valida' },
        { status: 500 }
      );
    }

    // Verifica formato URL
    if (!supabaseUrl.startsWith('https://')) {
      console.error('URL Supabase non valido:', supabaseUrl);
      return NextResponse.json(
        { error: 'Configurazione Supabase non valida' },
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

    // Usa client Supabase diretto con configurazione per retry e timeout
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
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
      // Salva la sessione nei cookie usando Supabase SSR
      const cookieStore = await cookies();
      const supabaseSSR = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            },
          },
        }
      );

      // Imposta la sessione nel client SSR
      await supabaseSSR.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      // Crea la risposta con i cookie aggiornati
      const response = NextResponse.json({
        user: data.user,
        session: data.session,
      });

      // Copia i cookie dalla cookieStore alla risposta
      cookieStore.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      });

      return response;
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
      // Type guard per errori Supabase
      const errorMessage = (error as any)?.message || (error instanceof Error ? error.message : 'Errore sconosciuto');
      const errorStatus = (error as any)?.status;
      const errorName = (error as any)?.name || (error instanceof Error ? error.name : 'Unknown');

      console.error('Errore Supabase auth dopo retry:', {
        message: errorMessage,
        status: errorStatus,
        name: errorName,
        url: supabaseUrl,
      });
      
      // Gestione specifica per "fetch failed" - problema di connettività
      if (errorMessage?.includes('fetch failed') || 
          errorMessage?.includes('Failed to fetch') ||
          errorMessage?.includes('NetworkError') ||
          errorMessage?.includes('Network request failed')) {
        console.error('Errore di rete Supabase:', {
          url: supabaseUrl,
          error: errorMessage,
        });
        return NextResponse.json(
          { 
            error: 'Errore di connessione al server di autenticazione. Verifica la configurazione e la connettività.',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
          },
          { status: 503 }
        );
      }
      
      // Altri errori di autenticazione
      return NextResponse.json(
        { error: errorMessage || 'Credenziali non valide' },
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

