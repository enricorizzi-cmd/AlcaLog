import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/fornitori - Lista fornitori
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const ricerca = searchParams.get('ricerca');
    const archiviato = searchParams.get('archiviato') === 'true';

    let query = supabase
      .from('fornitori')
      .select('*')
      .order('descrizione', { ascending: true });

    // Filtro archiviato (default: solo non archiviati)
    if (!archiviato) {
      query = query.eq('archiviato', false);
    }

    // Ricerca per descrizione
    if (ricerca) {
      query = query.ilike('descrizione', `%${ricerca}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore recupero fornitori:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/fornitori - Crea fornitore
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
    const { codice, descrizione, referente, telefono, mail, indirizzo } = body;

    if (!codice || !descrizione) {
      return NextResponse.json(
        { error: 'Codice e descrizione sono obbligatori' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('fornitori')
      .insert({
        codice,
        descrizione,
        referente: referente || null,
        telefono: telefono || null,
        mail: mail || null,
        indirizzo: indirizzo || null,
        archiviato: false,
      })
      .select()
      .single();

    if (error) {
      // Errore di unicità
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Codice fornitore già esistente' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Errore creazione fornitore:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


