import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/inventari/[id]/invia - Invia inventario (genera movimenti rettifiche)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Recupera inventario con righe
    const { data: inventario, error: inventarioError } = await supabase
      .from('inventari')
      .select('*, righe:inventari_righe(*)')
      .eq('id', parseInt(id))
      .single();

    if (inventarioError || !inventario) {
      return NextResponse.json(
        { error: 'Inventario non trovato' },
        { status: 404 }
      );
    }

    if (inventario.inviato_at) {
      return NextResponse.json(
        { error: 'Inventario già inviato' },
        { status: 400 }
      );
    }

    const now = new Date();
    const dataEffettiva = now.toISOString().split('T')[0];
    const oraEffettiva = now.toTimeString().split(' ')[0];

    // Genera movimenti rettifiche per ogni riga con differenza
    const movimentiCreati = [];
    
    for (const riga of inventario.righe || []) {
      if (riga.conteggio_fisico === null) {
        continue; // Salta righe senza conteggio
      }

      const differenza = riga.conteggio_fisico - riga.giacenza_teorica;

      if (differenza === 0) {
        continue; // Nessuna rettifica necessaria
      }

      // Crea movimento rettifica (CARICO se positivo, SCARICO se negativo)
      const tipoMovimento = differenza > 0 ? 'CARICO' : 'SCARICO';
      const quantitaMovimento = Math.abs(differenza);

      const { error: movimentoError } = await supabase
        .from('movimenti_magazzino')
        .insert({
          tipo_movimento: tipoMovimento,
          articolo: riga.articolo,
          lotto_id: riga.lotto_id,
          sede: riga.sede,
          sezione: riga.sezione,
          quantita: differenza, // Positivo o negativo a seconda della differenza
          data_effettiva: dataEffettiva,
          ora_effettiva: oraEffettiva,
          note_riga: `Rettifica inventario ${inventario.id} - Diff: ${differenza.toFixed(4)}`,
          utente_id: user.id,
        });

      if (movimentoError) {
        console.error('Errore creazione movimento rettifica:', movimentoError);
        return NextResponse.json(
          { error: `Errore nella rettifica: ${movimentoError.message}` },
          { status: 400 }
        );
      }

      movimentiCreati.push({
        articolo: riga.articolo,
        differenza,
        tipoMovimento,
      });
    }

    // Marca inventario come inviato
    const { error: updateError } = await supabase
      .from('inventari')
      .update({
        inviato_at: now.toISOString(),
      })
      .eq('id', parseInt(id));

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // TODO: Trigger notifica INVENTARIO_INVIATO

    return NextResponse.json({
      success: true,
      movimenti_creati: movimentiCreati.length,
      dettaglio: movimentiCreati,
    });
  } catch (error) {
    console.error('Errore invio inventario:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

