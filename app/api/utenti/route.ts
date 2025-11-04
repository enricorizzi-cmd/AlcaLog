import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/utenti - Lista utenti
export async function GET() {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('utenti_profilo')
      .select('*, ruolo:ruoli(*)')
      .order('cognome', { ascending: true })
      .order('nome', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Arricchisci con email da auth.users
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const utentiArricchiti = await Promise.all(
      (data || []).map(async (utente: any) => {
        // Recupera email da auth.users
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(utente.id);

        return {
          ...utente,
          email: authUser?.user?.email || utente.email || '',
        };
      })
    );

    return NextResponse.json(utentiArricchiti);
  } catch (error) {
    console.error('Errore recupero utenti:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

