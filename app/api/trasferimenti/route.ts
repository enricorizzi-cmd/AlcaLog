import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/trasferimenti - Lista trasferimenti
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const dataDa = searchParams.get('data_da');
    const dataA = searchParams.get('data_a');
    const sedeOrigine = searchParams.get('sede_origine');
    const sedeDestinazione = searchParams.get('sede_destinazione');
    const articolo = searchParams.get('articolo');

    let query = supabase
      .from('trasferimenti')
      .select('*, articolo_data:articoli(*), lotto_data:articoli_lotti(*)')
      .order('data_effettiva', { ascending: false })
      .order('ora_effettiva', { ascending: false });

    // Filtri
    if (dataDa) {
      query = query.gte('data_effettiva', dataDa);
    }
    if (dataA) {
      query = query.lte('data_effettiva', dataA);
    }
    if (sedeOrigine) {
      query = query.eq('sede_origine', sedeOrigine);
    }
    if (sedeDestinazione) {
      query = query.eq('sede_destinazione', sedeDestinazione);
    }
    if (articolo) {
      query = query.eq('articolo', articolo);
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
    console.error('Errore recupero trasferimenti:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/trasferimenti - Crea trasferimento
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
      articolo,
      lotto_id,
      batch_id,
      sede_origine,
      sezione_origine,
      sede_destinazione,
      sezione_destinazione,
      quantita,
      note,
    } = body;

    if (!articolo || !quantita || !sede_origine || !sezione_origine || 
        !sede_destinazione || !sezione_destinazione) {
      return NextResponse.json(
        { error: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    // Se batch_id fornito, decodifica
    let lottoIdFinale = lotto_id;
    if (batch_id && !lotto_id) {
      const { data: lotto } = await supabase
        .from('articoli_lotti')
        .select('id')
        .eq('id', batch_id)
        .single();

      if (!lotto) {
        return NextResponse.json(
          { error: 'BATCH_ID non valido' },
          { status: 404 }
        );
      }
      lottoIdFinale = lotto.id;
    }

    if (!lottoIdFinale) {
      return NextResponse.json(
        { error: 'Lotto o BATCH_ID obbligatorio' },
        { status: 400 }
      );
    }

    // Verifica giacenza origine
    const { data: giacenze } = await supabase
      .from('giacenze_v')
      .select('quantita_giacente')
      .eq('articolo', articolo)
      .eq('sede', sede_origine)
      .eq('sezione', sezione_origine);

    const giacenza = giacenze?.[0]?.quantita_giacente || 0;
    
    if (parseFloat(quantita) > giacenza) {
      return NextResponse.json(
        { error: 'Giacenza insufficiente per il trasferimento' },
        { status: 400 }
      );
    }

    const now = new Date();
    const dataEffettiva = now.toISOString().split('T')[0];
    const oraEffettiva = now.toTimeString().split(' ')[0];

    // Crea trasferimento
    const { data: trasferimento, error: trasferimentoError } = await supabase
      .from('trasferimenti')
      .insert({
        articolo,
        lotto_id: lottoIdFinale,
        sede_origine,
        sezione_origine,
        sede_destinazione,
        sezione_destinazione,
        quantita: parseFloat(quantita),
        data_effettiva: dataEffettiva,
        ora_effettiva: oraEffettiva,
        note: note || null,
      })
      .select()
      .single();

    if (trasferimentoError) {
      return NextResponse.json(
        { error: trasferimentoError.message },
        { status: 400 }
      );
    }

    // Crea movimenti TRASF_OUT e TRASF_IN
    const quantitaNum = parseFloat(quantita);

    // TRASF_OUT (origine)
    const { error: movimentoOutError } = await supabase
      .from('movimenti_magazzino')
      .insert({
        tipo_movimento: 'TRASF_OUT',
        articolo,
        lotto_id: lottoIdFinale,
        sede: sede_origine,
        sezione: sezione_origine,
        quantita: -quantitaNum, // Negativo per uscita
        data_effettiva: dataEffettiva,
        ora_effettiva: oraEffettiva,
        trasferimento_id: trasferimento.id,
        utente_id: user.id,
      });

    // TRASF_IN (destinazione)
    const { error: movimentoInError } = await supabase
      .from('movimenti_magazzino')
      .insert({
        tipo_movimento: 'TRASF_IN',
        articolo,
        lotto_id: lottoIdFinale,
        sede: sede_destinazione,
        sezione: sezione_destinazione,
        quantita: quantitaNum, // Positivo per ingresso
        data_effettiva: dataEffettiva,
        ora_effettiva: oraEffettiva,
        trasferimento_id: trasferimento.id,
        utente_id: user.id,
      });

    if (movimentoOutError || movimentoInError) {
      // Elimina trasferimento se falliscono i movimenti
      await supabase.from('trasferimenti').delete().eq('id', trasferimento.id);
      return NextResponse.json(
        { error: 'Errore nella creazione dei movimenti' },
        { status: 400 }
      );
    }

    return NextResponse.json(trasferimento, { status: 201 });
  } catch (error) {
    console.error('Errore creazione trasferimento:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


