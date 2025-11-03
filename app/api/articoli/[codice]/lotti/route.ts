import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBatchId } from '@/lib/utils/batch-id';

// GET /api/articoli/[codice]/lotti - Lista lotti articolo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codice: string }> }
) {
  try {
    const { codice } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('articoli_lotti')
      .select('*')
      .eq('articolo', codice)
      .order('scadenza', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore recupero lotti:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/articoli/[codice]/lotti - Crea lotto (con logica q.tà > 0 → prezzo → carico)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ codice: string }> }
) {
  try {
    const { codice } = await params;
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
    const { lotto_fornitore, scadenza, quantita, prezzo_unitario, sede, sezione } = body;

    if (!lotto_fornitore || !scadenza) {
      return NextResponse.json(
        { error: 'Lotto fornitore e scadenza sono obbligatori' },
        { status: 400 }
      );
    }

    // Genera BATCH_ID
    const batchId = await generateBatchId();

    // Crea lotto
    const { data: lotto, error: lottoError } = await supabase
      .from('articoli_lotti')
      .insert({
        id: batchId,
        lotto_fornitore,
        articolo: codice,
        scadenza,
      })
      .select()
      .single();

    if (lottoError) {
      // Errore unicità (articolo, lotto_fornitore, scadenza)
      if (lottoError.code === '23505') {
        return NextResponse.json(
          { error: 'Lotto con questa scadenza già esistente per questo articolo' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: lottoError.message },
        { status: 400 }
      );
    }

    // Se quantita > 0, richiede prezzo e genera CARICO
    if (quantita && parseFloat(quantita) > 0) {
      if (!prezzo_unitario) {
        // Elimina lotto se manca prezzo ma c'è quantità
        await supabase.from('articoli_lotti').delete().eq('id', batchId);
        return NextResponse.json(
          { error: 'Prezzo obbligatorio quando quantità > 0' },
          { status: 400 }
        );
      }

      if (!sede || !sezione) {
        return NextResponse.json(
          { error: 'Sede e sezione sono obbligatorie per il carico' },
          { status: 400 }
        );
      }

      const now = new Date();
      const dataEffettiva = now.toISOString().split('T')[0];
      const oraEffettiva = now.toTimeString().split(' ')[0];

      // Genera movimento CARICO
      const { error: movimentoError } = await supabase
        .from('movimenti_magazzino')
        .insert({
          tipo_movimento: 'CARICO',
          articolo: codice,
          lotto_id: batchId,
          sede,
          sezione,
          quantita: parseFloat(quantita),
          prezzo_unitario: parseFloat(prezzo_unitario),
          data_effettiva: dataEffettiva,
          ora_effettiva: oraEffettiva,
          utente_id: user.id,
        });

      if (movimentoError) {
        console.error('Errore creazione movimento:', movimentoError);
        // Non elimino il lotto, ma segnalo l'errore
        return NextResponse.json(
          { 
            error: 'Lotto creato ma errore nel movimento',
            lotto,
            movimento_error: movimentoError.message 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(lotto, { status: 201 });
  } catch (error) {
    console.error('Errore creazione lotto:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

