import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/articoli - Lista articoli con filtri
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const ricerca = searchParams.get('ricerca');
    const tipologia = searchParams.get('tipologia');
    const categoria = searchParams.get('categoria');
    const fornitore = searchParams.get('fornitore');
    const archiviato = searchParams.get('archiviato') === 'true';

    let query = supabase
      .from('articoli')
      .select('*, fornitore_predefinito:fornitori(*)')
      .order('descrizione', { ascending: true });

    // Filtro archiviato (default: solo non archiviati)
    if (!archiviato) {
      query = query.eq('archiviato', false);
    }

    // Filtri
    if (ricerca) {
      query = query.or(`descrizione.ilike.%${ricerca}%,codice_interno.ilike.%${ricerca}%,codice_fornitore.ilike.%${ricerca}%`);
    }
    if (tipologia) {
      query = query.eq('tipologia', tipologia);
    }
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    if (fornitore) {
      query = query.eq('fornitore_predefinito', fornitore);
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
    console.error('Errore recupero articoli:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/articoli - Crea articolo
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
    const {
      codice_interno,
      tipologia,
      categoria,
      codice_fornitore,
      fornitore_predefinito,
      descrizione,
      peso_netto,
      unita_misura,
      ultimo_prezzo,
      scorta_minima,
    } = body;

    if (!codice_interno || !descrizione) {
      return NextResponse.json(
        { error: 'Codice interno e descrizione sono obbligatori' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('articoli')
      .insert({
        codice_interno,
        tipologia: tipologia || null,
        categoria: categoria || null,
        codice_fornitore: codice_fornitore || null,
        fornitore_predefinito: fornitore_predefinito || null,
        descrizione,
        peso_netto: peso_netto ? parseFloat(peso_netto) : null,
        unita_misura: unita_misura || null,
        ultimo_prezzo: ultimo_prezzo ? parseFloat(ultimo_prezzo) : null,
        scorta_minima: scorta_minima ? parseFloat(scorta_minima) : null,
        archiviato: false,
      })
      .select()
      .single();

    if (error) {
      // Errore di unicità
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Codice articolo già esistente' },
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
    console.error('Errore creazione articolo:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


