import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notifiche/config - Lista configurazione notifiche
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
      .from('notifiche_eventi_config')
      .select('*')
      .order('evento');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Errore recupero config notifiche:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/notifiche/config - Salva configurazione notifiche
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const configs = Array.isArray(body) ? body : [body];

    // Elimina tutte le configurazioni esistenti
    const { error: deleteError } = await supabase
      .from('notifiche_eventi_config')
      .delete()
      .neq('id', 0); // Delete all

    if (deleteError) {
      console.error('Errore eliminazione config:', deleteError);
    }

    // Inserisci nuove configurazioni
    if (configs.length > 0) {
      const { error: insertError } = await supabase
        .from('notifiche_eventi_config')
        .insert(configs.map((c: any) => ({
          evento: c.evento,
          ruolo_codice: c.ruolo_codice,
        })));

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore salvataggio config notifiche:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

