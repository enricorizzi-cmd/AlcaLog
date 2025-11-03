import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/ordini/[id] - Dettaglio ordine con righe e residui
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Recupera ordine con righe
    const { data: ordine, error: ordineError } = await supabase
      .from('ordini_fornitori')
      .select('*, fornitore_movimento:fornitori(*), righe:ordini_fornitori_righe(*)')
      .eq('id', parseInt(id))
      .single();

    if (ordineError || !ordine) {
      return NextResponse.json(
        { error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    // Recupera residui per ogni riga
    const righeConResidui = await Promise.all(
      (ordine.righe || []).map(async (riga: any) => {
        const { data: residui } = await supabase
          .from('ordini_residuo_v')
          .select('*')
          .eq('ordine_riga_id', riga.id)
          .single();

        return {
          ...riga,
          residuo: residui || null,
        };
      })
    );

    return NextResponse.json({
      ...ordine,
      righe: righeConResidui,
    });
  } catch (error) {
    console.error('Errore recupero ordine:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

