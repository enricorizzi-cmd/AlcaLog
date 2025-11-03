import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/ordini - Lista ordini
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const dataDa = searchParams.get('data_da');
    const dataA = searchParams.get('data_a');
    const fornitore = searchParams.get('fornitore');

    let query = supabase
      .from('ordini_fornitori')
      .select('*, fornitore_movimento:fornitori(*)')
      .order('data_ordine', { ascending: false });

    // Filtri
    if (dataDa) {
      query = query.gte('data_ordine', dataDa);
    }
    if (dataA) {
      query = query.lte('data_ordine', dataA);
    }
    if (fornitore) {
      query = query.eq('fornitore_movimento', fornitore);
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
    console.error('Errore recupero ordini:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/ordini - Crea ordine (testata + righe)
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
    const { testata, righe } = body;

    if (!testata || !righe || !Array.isArray(righe)) {
      return NextResponse.json(
        { error: 'Testata e righe sono obbligatorie' },
        { status: 400 }
      );
    }

    // Calcola prezzo medio FIFO snapshot per ogni riga
    const { calcolaPrezzoMedioFIFO } = await import('@/lib/utils/fifo');
    
    const righeConFifo = await Promise.all(
      righe.map(async (riga: any) => {
        if (riga.articolo) {
          const prezzoFifo = await calcolaPrezzoMedioFIFO(riga.articolo);
          return {
            ...riga,
            prezzo_medio_fifo_snapshot: prezzoFifo,
          };
        }
        return riga;
      })
    );

    // Crea ordine (testata)
    const { data: ordine, error: ordineError } = await supabase
      .from('ordini_fornitori')
      .insert({
        data_ordine: testata.data_ordine,
        numero_ordine: testata.numero_ordine || null,
        fornitore_movimento: testata.fornitore_movimento,
        note_totali: testata.note_totali || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (ordineError) {
      return NextResponse.json(
        { error: ordineError.message },
        { status: 400 }
      );
    }

    // Crea righe
    const righeInsert = righeConFifo.map((riga: any) => ({
      ordine_id: ordine.id,
      tipologia: riga.tipologia || null,
      categoria: riga.categoria || null,
      codice_fornitore: riga.codice_fornitore || null,
      fornitore_predef_articolo: riga.fornitore_predef_articolo || null,
      articolo: riga.articolo || null,
      descrizione: riga.descrizione || null,
      peso_netto: riga.peso_netto ? parseFloat(riga.peso_netto) : null,
      unita_misura: riga.unita_misura || null,
      ultimo_prezzo: riga.ultimo_prezzo ? parseFloat(riga.ultimo_prezzo) : null,
      prezzo_medio_fifo_snapshot: riga.prezzo_medio_fifo_snapshot || null,
      quantita_ordine: parseFloat(riga.quantita_ordine),
      data_arrivo_prevista: riga.data_arrivo_prevista || null,
    }));

    const { error: righeError } = await supabase
      .from('ordini_fornitori_righe')
      .insert(righeInsert);

    if (righeError) {
      // Elimina ordine se falliscono le righe
      await supabase.from('ordini_fornitori').delete().eq('id', ordine.id);
      return NextResponse.json(
        { error: righeError.message },
        { status: 400 }
      );
    }

    // TODO: Trigger notifica CREAZIONE_ORDINE

    // Recupera ordine completo
    const { data: ordineCompleto } = await supabase
      .from('ordini_fornitori')
      .select('*, righe:ordini_fornitori_righe(*)')
      .eq('id', ordine.id)
      .single();

    return NextResponse.json(ordineCompleto, { status: 201 });
  } catch (error) {
    console.error('Errore creazione ordine:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

