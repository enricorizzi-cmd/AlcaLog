import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/ricevimenti/[ordine_id] - Dettaglio ordine per ricevimento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ordine_id: string }> }
) {
  try {
    const { ordine_id } = await params;
    const supabase = await createClient();

    // Recupera ordine con righe e residui
    const { data: ordine, error: ordineError } = await supabase
      .from('ordini_fornitori')
      .select('*, fornitore_movimento:fornitori(*), righe:ordini_fornitori_righe(*)')
      .eq('id', parseInt(ordine_id))
      .single();

    if (ordineError || !ordine) {
      return NextResponse.json(
        { error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    // Calcola residui per ogni riga
    const righeConResidui = await Promise.all(
      (ordine.righe || []).map(async (riga: any) => {
        const { data: residuo } = await supabase
          .from('ordini_residuo_v')
          .select('*')
          .eq('ordine_riga_id', riga.id)
          .single();

        return {
          ...riga,
          residuo: residuo || null,
        };
      })
    );

    return NextResponse.json({
      ...ordine,
      righe: righeConResidui,
    });
  } catch (error) {
    console.error('Errore recupero ricevimento:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


