import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBatchId } from '@/lib/utils/batch-id';

// POST /api/ricevimenti/[ordine_id]/evadi - Evade ricevimento (carico)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ordine_id: string }> }
) {
  try {
    const { ordine_id } = await params;
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
    const { righe, note_totali, sede, sezione } = body;

    if (!righe || !Array.isArray(righe) || righe.length === 0) {
      return NextResponse.json(
        { error: 'Almeno una riga è obbligatoria' },
        { status: 400 }
      );
    }

    if (!sede || !sezione) {
      return NextResponse.json(
        { error: 'Sede e sezione sono obbligatorie' },
        { status: 400 }
      );
    }

    const now = new Date();
    const dataEffettiva = now.toISOString().split('T')[0];
    const oraEffettiva = now.toTimeString().split(' ')[0];

    // Processa ogni riga
    const movimentiCreati = [];
    const lottiCreati = [];
    const notificheDaInviare = [];

    for (const riga of righe) {
      const { ordine_riga_id, articolo, quantita, lotto_fornitore, scadenza, prezzo_unitario } = riga;

      if (!quantita || parseFloat(quantita) <= 0) {
        continue; // Salta righe senza quantità
      }

      if (!lotto_fornitore || !scadenza) {
        return NextResponse.json(
          { error: `Lotto fornitore e scadenza obbligatorie per riga ${ordine_riga_id}` },
          { status: 400 }
        );
      }

      // Verifica/crea lotto
      let lottoId: string;
      
      const { data: lottoEsistente } = await supabase
        .from('articoli_lotti')
        .select('id')
        .eq('articolo', articolo)
        .eq('lotto_fornitore', lotto_fornitore)
        .eq('scadenza', scadenza)
        .single();

      if (lottoEsistente) {
        lottoId = lottoEsistente.id;
      } else {
        // Crea nuovo lotto
        lottoId = await generateBatchId();
        const { error: lottoError } = await supabase
          .from('articoli_lotti')
          .insert({
            id: lottoId,
            articolo,
            lotto_fornitore,
            scadenza,
          });

        if (lottoError) {
          return NextResponse.json(
            { error: `Errore creazione lotto: ${lottoError.message}` },
            { status: 400 }
          );
        }
        lottiCreati.push(lottoId);
      }

      // Crea movimento CARICO
      const { error: movimentoError } = await supabase
        .from('movimenti_magazzino')
        .insert({
          tipo_movimento: 'CARICO',
          articolo,
          lotto_id: lottoId,
          sede,
          sezione,
          quantita: parseFloat(quantita),
          prezzo_unitario: prezzo_unitario ? parseFloat(prezzo_unitario) : null,
          data_effettiva: dataEffettiva,
          ora_effettiva: oraEffettiva,
          ordine_riga_id: ordine_riga_id ? parseInt(ordine_riga_id) : null,
          utente_id: user.id,
        });

      if (movimentoError) {
        console.error('Errore creazione movimento:', movimentoError);
        return NextResponse.json(
          { error: `Errore creazione movimento: ${movimentoError.message}` },
          { status: 400 }
        );
      }

      movimentiCreati.push({ articolo, quantita, lottoId });

      // Se prezzo mancante, notifica
      if (!prezzo_unitario) {
        notificheDaInviare.push({
          evento: 'RIGA_AGGIUNTA_PREZZO_DA_DEFINIRE',
          riferimento: ordine_riga_id?.toString(),
          messaggio: `Riga ordine ${ordine_riga_id} caricata senza prezzo per articolo ${articolo}`,
        });
      }
    }

    // Salva note se presenti
    if (note_totali) {
      await supabase
        .from('ricevimenti_note')
        .insert({
          ordine_id: parseInt(ordine_id),
          testo: note_totali,
        });
    }

    // TODO: Trigger notifiche EVASIONE_RICEVIMENTO e CREAZIONE_QR

    return NextResponse.json({
      success: true,
      movimenti_creati: movimentiCreati.length,
      lotti_creati: lottiCreati.length,
      notifiche: notificheDaInviare.length,
    });
  } catch (error) {
    console.error('Errore evasione ricevimento:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


