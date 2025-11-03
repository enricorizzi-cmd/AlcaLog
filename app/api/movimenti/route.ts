import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/movimenti - Lista movimenti con filtri avanzati
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const dataDa = searchParams.get('data_da');
    const dataA = searchParams.get('data_a');
    const tipoMovimento = searchParams.get('tipo_movimento');
    const articolo = searchParams.get('articolo');
    const sede = searchParams.get('sede');
    const sezione = searchParams.get('sezione');
    const lottoId = searchParams.get('lotto_id');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('movimenti_magazzino')
      .select(`
        *,
        articolo_data:articoli(*),
        lotto_data:articoli_lotti(*),
        utente:utenti_profilo(nome, cognome)
      `)
      .order('data_effettiva', { ascending: false })
      .order('ora_effettiva', { ascending: false });

    // Filtri
    if (dataDa) {
      query = query.gte('data_effettiva', dataDa);
    }
    if (dataA) {
      query = query.lte('data_effettiva', dataA);
    }
    if (tipoMovimento) {
      query = query.eq('tipo_movimento', tipoMovimento);
    }
    if (articolo) {
      query = query.eq('articolo', articolo);
    }
    if (sede) {
      query = query.eq('sede', sede);
    }
    if (sezione) {
      query = query.eq('sezione', sezione);
    }
    if (lottoId) {
      query = query.eq('lotto_id', lottoId);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    } else {
      query = query.limit(1000); // Default limit
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
    console.error('Errore recupero movimenti:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/movimenti - Inserimento manuale movimento
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
      tipo_movimento,
      articolo,
      lotto_id,
      sede,
      sezione,
      quantita,
      prezzo_unitario,
      data_effettiva,
      ora_effettiva,
      note_riga,
    } = body;

    if (!tipo_movimento || !articolo || !lotto_id || !sede || !sezione || !quantita) {
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      );
    }

    // Prezzo obbligatorio solo per CARICO
    if (tipo_movimento === 'CARICO' && !prezzo_unitario) {
      return NextResponse.json(
        { error: 'Prezzo obbligatorio per movimenti CARICO' },
        { status: 400 }
      );
    }

    const now = new Date();
    const dataFinale = data_effettiva || now.toISOString().split('T')[0];
    const oraFinale = ora_effettiva || now.toTimeString().split(' ')[0];

    const { data, error } = await supabase
      .from('movimenti_magazzino')
      .insert({
        tipo_movimento,
        articolo,
        lotto_id,
        sede,
        sezione,
        quantita: parseFloat(quantita),
        prezzo_unitario: prezzo_unitario ? parseFloat(prezzo_unitario) : null,
        data_effettiva: dataFinale,
        ora_effettiva: oraFinale,
        note_riga: note_riga || null,
        utente_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Errore creazione movimento:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


