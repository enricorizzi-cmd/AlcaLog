import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/prelievi/scarico - Crea scarico (prelievo)
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
    const { articolo, lotto_id, batch_id, quantita, sede, sezione, note } = body;

    if (!quantita || !sede || !sezione) {
      return NextResponse.json(
        { error: 'Quantità, sede e sezione sono obbligatorie' },
        { status: 400 }
      );
    }

    // Se batch_id fornito, decodifica per ottenere lotto_id
    let lottoIdFinale = lotto_id;
    
    if (batch_id && !lotto_id) {
      const { data: lotto } = await supabase
        .from('articoli_lotti')
        .select('id, articolo')
        .eq('id', batch_id)
        .single();

      if (!lotto) {
        return NextResponse.json(
          { error: 'BATCH_ID non valido' },
          { status: 404 }
        );
      }

      lottoIdFinale = lotto.id;
      
      // Se articolo non fornito, usa quello del lotto
      if (!articolo) {
        const articoloCodice = lotto.articolo;
        // Verifica giacenza
        const { data: giacenze } = await supabase
          .from('giacenze_v')
          .select('quantita_giacente')
          .eq('articolo', articoloCodice)
          .eq('sede', sede)
          .eq('sezione', sezione);

        const giacenza = giacenze?.[0]?.quantita_giacente || 0;
        
        if (parseFloat(quantita) > giacenza) {
          // Giacenza negativa permessa, ma notifica
          const { triggerNotifiche } = await import('@/lib/notifications-trigger');
          await triggerNotifiche(
            'PRELIEVO_NEGATIVO_O_LOTTO_ASSENTE',
            `Prelievo supera giacenza: articolo ${articoloCodice}, quantità richiesta ${quantita}, giacenza ${giacenza}`,
            articoloCodice,
            `/dashboard/prelievo`
          );
        }

        const now = new Date();
        const dataEffettiva = now.toISOString().split('T')[0];
        const oraEffettiva = now.toTimeString().split(' ')[0];

        const { error: movimentoError } = await supabase
          .from('movimenti_magazzino')
          .insert({
            tipo_movimento: 'SCARICO',
            articolo: articoloCodice,
            lotto_id: lottoIdFinale,
            sede,
            sezione,
            quantita: -Math.abs(parseFloat(quantita)), // Negativo per scarico
            data_effettiva: dataEffettiva,
            ora_effettiva: oraEffettiva,
            note_riga: note || null,
            utente_id: user.id,
          });

        if (movimentoError) {
          return NextResponse.json(
            { error: movimentoError.message },
            { status: 400 }
          );
        }

        return NextResponse.json({ success: true });
      }
    }

    if (!articolo || !lottoIdFinale) {
      return NextResponse.json(
        { error: 'Articolo e lotto sono obbligatori' },
        { status: 400 }
      );
    }

    // Verifica giacenza
    const { data: giacenze } = await supabase
      .from('giacenze_v')
      .select('quantita_giacente')
      .eq('articolo', articolo)
      .eq('sede', sede)
      .eq('sezione', sezione);

    const giacenza = giacenze?.[0]?.quantita_giacente || 0;
    const quantitaNum = parseFloat(quantita);

    if (quantitaNum > giacenza) {
      // Giacenza negativa permessa, ma notifica
      const { triggerNotifiche } = await import('@/lib/notifications-trigger');
      await triggerNotifiche(
        'PRELIEVO_NEGATIVO_O_LOTTO_ASSENTE',
        `Prelievo supera giacenza: articolo ${articolo}, quantità richiesta ${quantita}, giacenza ${giacenza}`,
        articolo,
        `/dashboard/prelievo`
      );
    }

    const now = new Date();
    const dataEffettiva = now.toISOString().split('T')[0];
    const oraEffettiva = now.toTimeString().split(' ')[0];

    const { error: movimentoError } = await supabase
      .from('movimenti_magazzino')
      .insert({
        tipo_movimento: 'SCARICO',
        articolo,
        lotto_id: lottoIdFinale,
        sede,
        sezione,
        quantita: -Math.abs(quantitaNum), // Negativo per scarico
        data_effettiva: dataEffettiva,
        ora_effettiva: oraEffettiva,
        note_riga: note || null,
        utente_id: user.id,
      });

    if (movimentoError) {
      return NextResponse.json(
        { error: movimentoError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore scarico:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


